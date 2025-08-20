import type { DB } from "@/db";
import { z } from "zod";
import { getDistanceMatrix, calculateHaversineDistance } from "@/lib/google-maps";
import { eq, and } from "drizzle-orm";
import { pricingConfig } from "@/db/sqlite/schema/price-config";
import { cars } from "@/db/sqlite/schema/cars";

export const CalculateCarSpecificQuoteSchema = z.object({
	carId: z.string().min(1, "Car ID is required"),
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	originLatitude: z.number().optional(),
	originLongitude: z.number().optional(),
	destinationLatitude: z.number().optional(),
	destinationLongitude: z.number().optional(),
	scheduledPickupTime: z.coerce.date().optional().default(new Date()),
	stops: z.array(z.object({
		address: z.string(),
		latitude: z.number().optional(),
		longitude: z.number().optional(),
		waitingTime: z.number().int().default(0), // in minutes
	})).optional(),
});

export type CalculateCarSpecificQuoteParams = z.infer<typeof CalculateCarSpecificQuoteSchema>;

export interface CarSpecificQuote {
	baseFare: number;
	distanceFare: number;
	timeFare: number;
	extraCharges: number;
	totalAmount: number;
	estimatedDistance: number; // in meters
	estimatedDuration: number; // in seconds
	car: {
		id: string;
		name: string;
		baseFare: number;
		brandName?: string;
		modelName?: string;
	};
	breakdown: {
		baseRate: number;
		perKmRate: number;
		perMinuteRate: number;
		minimumFare: number;
		surgePricing?: number;
		waitingTimeCharges?: number;
	};
}

export async function calculateCarSpecificQuoteService(
	db: DB, 
	data: CalculateCarSpecificQuoteParams,
	env?: { GOOGLE_MAPS_API_KEY?: string }
): Promise<CarSpecificQuote> {
	// Get the specific car details including base fare
	const carResult = await db
		.select({
			id: cars.id,
			name: cars.name,
			baseFare: cars.baseFare,
			// We need to join with related tables for full car info
		})
		.from(cars)
		.where(
			and(
				eq(cars.id, data.carId),
				eq(cars.isPublished, true),
				eq(cars.isActive, true),
				eq(cars.isAvailable, true)
			)
		)
		.limit(1);

	if (carResult.length === 0) {
		throw new Error("Car not found or not available");
	}

	const car = carResult[0];

	let totalDistance = 0;
	let totalDuration = 0;
	let totalWaitingTime = 0;

	try {
		// Calculate distance and duration (same logic as instant quote)
		const origins = [data.originAddress];
		const destinations = [data.destinationAddress];
		
		// Add stops if provided
		if (data.stops && data.stops.length > 0) {
			let currentOrigin = data.originAddress;
			
			for (const stop of data.stops) {
				const response = await getDistanceMatrix({
					origins: [currentOrigin],
					destinations: [stop.address],
					mode: "driving",
					units: "metric",
					avoidHighways: false,
					avoidTolls: false,
				}, env);
				
				if (response.rows[0]?.elements[0]?.status === "OK") {
					const element = response.rows[0].elements[0];
					totalDistance += element.distance?.value || 0;
					totalDuration += element.duration?.value || 0;
					totalWaitingTime += stop.waitingTime;
				}
				
				currentOrigin = stop.address;
			}
			
			// Final segment
			const finalResponse = await getDistanceMatrix({
				origins: [currentOrigin],
				destinations: [data.destinationAddress],
				mode: "driving",
				units: "metric",
				avoidHighways: false,
				avoidTolls: false,
			}, env);
			
			if (finalResponse.rows[0]?.elements[0]?.status === "OK") {
				const element = finalResponse.rows[0].elements[0];
				totalDistance += element.distance?.value || 0;
				totalDuration += element.duration?.value || 0;
			}
		} else {
			// Simple origin to destination
			const response = await getDistanceMatrix({
				origins,
				destinations,
				mode: "driving",
				units: "metric",
				avoidHighways: false,
				avoidTolls: false,
			}, env);

			if (response.rows[0]?.elements[0]?.status === "OK") {
				const element = response.rows[0].elements[0];
				totalDistance = element.distance?.value || 0;
				totalDuration = element.duration?.value || 0;
			}
		}
	} catch (error) {
		console.warn("Google Maps API failed, using fallback calculation:", error);
		
		// Fallback calculation
		if (data.originLatitude && data.originLongitude && 
			data.destinationLatitude && data.destinationLongitude) {
			
			const fallback = calculateHaversineDistance(
				data.originLatitude,
				data.originLongitude,
				data.destinationLatitude,
				data.destinationLongitude
			);
			
			totalDistance = fallback.distanceKm * 1000;
			totalDuration = fallback.durationSeconds;
		} else {
			totalDistance = 15000; // 15km default
			totalDuration = 1800; // 30 minutes default
		}
	}

	// Get active pricing configuration for distance and time rates
	const activePricingConfig = await db
		.select()
		.from(pricingConfig)
		.where(eq(pricingConfig.isActive, true))
		.limit(1);

	let pricing;
	if (activePricingConfig.length > 0) {
		const config = activePricingConfig[0];
		pricing = {
			baseRate: car.baseFare, // Use car's specific base fare
			perKmRate: config.pricePerKm,
			perMinuteRate: config.pricePerMinute || 50,
			minimumFare: car.baseFare, // Use car's base fare as minimum
			waitingTimeRate: config.waitingChargePerMinute || 100,
		};
	} else {
		// Fallback pricing
		pricing = {
			baseRate: car.baseFare, // Use car's specific base fare
			perKmRate: 150, // $1.50 per km
			perMinuteRate: 50, // $0.50 per minute
			minimumFare: car.baseFare, // Use car's base fare as minimum
			waitingTimeRate: 100, // $1.00 per minute
		};
	}

	// Apply surge pricing
	const surgePricing = calculateSurgePricing(data.scheduledPickupTime);
	
	// Calculate fare components
	const baseFare = pricing.baseRate;
	const distanceKm = totalDistance / 1000;
	const durationMinutes = totalDuration / 60;
	
	const distanceFare = Math.round(distanceKm * pricing.perKmRate * surgePricing);
	const timeFare = 0; // Time fare excluded
	const waitingTimeCharges = totalWaitingTime * pricing.waitingTimeRate;
	
	let totalAmount = baseFare + distanceFare + waitingTimeCharges;
	
	// Apply minimum fare
	if (totalAmount < pricing.minimumFare) {
		totalAmount = pricing.minimumFare;
	}
	
	return {
		baseFare,
		distanceFare,
		timeFare,
		extraCharges: waitingTimeCharges,
		totalAmount,
		estimatedDistance: Math.round(totalDistance),
		estimatedDuration: Math.round(totalDuration),
		car: {
			id: car.id,
			name: car.name,
			baseFare: car.baseFare,
		},
		breakdown: {
			baseRate: pricing.baseRate,
			perKmRate: pricing.perKmRate,
			perMinuteRate: pricing.perMinuteRate,
			minimumFare: pricing.minimumFare,
			surgePricing: surgePricing > 1 ? surgePricing : undefined,
			waitingTimeCharges: waitingTimeCharges > 0 ? waitingTimeCharges : undefined,
		},
	};
}

// Calculate surge pricing based on time of day and day of week
function calculateSurgePricing(scheduledTime: Date): number {
	const hour = scheduledTime.getHours();
	const day = scheduledTime.getDay(); // 0 = Sunday, 6 = Saturday
	
	// Peak hours: 7-9 AM and 5-7 PM on weekdays
	const isWeekday = day >= 1 && day <= 5;
	const isMorningPeak = hour >= 7 && hour <= 9;
	const isEveningPeak = hour >= 17 && hour <= 19;
	const isWeekend = day === 0 || day === 6;
	const isLateNight = hour >= 22 || hour <= 5;
	
	if (isWeekday && (isMorningPeak || isEveningPeak)) {
		return 1.5; // 50% surge during peak hours
	}
	
	if (isWeekend && (hour >= 19 && hour <= 23)) {
		return 1.3; // 30% surge Friday/Saturday night
	}
	
	if (isLateNight) {
		return 1.2; // 20% surge for late night/early morning
	}
	
	return 1.0; // No surge
}