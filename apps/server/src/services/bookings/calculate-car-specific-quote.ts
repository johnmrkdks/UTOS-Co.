import type { DB } from "@/db";
import { z } from "zod";
import { getDistanceMatrix, calculateHaversineDistance } from "@/lib/google-maps";
import { eq, and, isNull } from "drizzle-orm";
import { pricingConfig, cars } from "@/db/schema";

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
	firstKmFare: number;
	additionalKmFare: number;
	totalAmount: number;
	estimatedDistance: number; // in meters
	estimatedDuration: number; // in seconds
	car: {
		id: string;
		name: string;
		firstKmRate: number;
		brandName?: string;
		modelName?: string;
	};
	breakdown: {
		firstKmRate: number;
		additionalKmRate: number;
		totalDistance: number; // in km
		firstKmDistance: number; // distance charged at first km rate
		additionalDistance: number; // distance charged at per km rate
	};
}

export async function calculateCarSpecificQuoteService(
	db: DB, 
	data: CalculateCarSpecificQuoteParams,
	env?: { GOOGLE_MAPS_API_KEY?: string }
): Promise<CarSpecificQuote> {
	// Get the specific car details
	const carResult = await db
		.select({
			id: cars.id,
			name: cars.name,
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

	// Try to get car-specific pricing configuration first
	let carPricingResult = await db
		.select()
		.from(pricingConfig)
		.where(eq(pricingConfig.carId, data.carId))
		.limit(1);

	// If no car-specific pricing exists, fallback to global pricing configuration
	if (carPricingResult.length === 0) {
		console.log(`No car-specific pricing found for car ${data.carId}, using global pricing configuration`);
		carPricingResult = await db
			.select()
			.from(pricingConfig)
			.where(isNull(pricingConfig.carId)) // Global pricing config
			.limit(1);
	}

	// If still no pricing config found, try any pricing config as last resort
	if (carPricingResult.length === 0) {
		console.log(`No global pricing found, using any pricing configuration as fallback`);
		carPricingResult = await db
			.select()
			.from(pricingConfig)
			.limit(1);
	}

	if (carPricingResult.length === 0) {
		throw new Error("No pricing configuration found. Please contact support or set up pricing configuration.");
	}

	const carPricing = carPricingResult[0];

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

	// Use car-specific pricing configuration
	const pricing = {
		firstKmRate: carPricing.firstKmRate,
		additionalKmRate: carPricing.pricePerKm,
		firstKmLimit: carPricing.firstKmLimit || 10,
	};

	// Calculate fare components using simplified two-tier pricing (same as quote tester)
	const distanceKm = totalDistance / 1000; // convert meters to km
	
	// Calculate using simplified two-tier pricing model (same logic as quote tester)
	let firstKmFare = 0;
	let additionalKmFare = 0;
	let firstKmDistance = 0;
	let additionalDistance = 0;
	
	if (distanceKm <= pricing.firstKmLimit) {
		// Distance is within first tier - pay flat rate
		firstKmFare = pricing.firstKmRate;
		firstKmDistance = distanceKm; // Record actual distance for breakdown
		additionalDistance = 0;
	} else {
		// Distance exceeds first tier - flat rate + additional per km
		firstKmFare = pricing.firstKmRate;
		additionalDistance = distanceKm - pricing.firstKmLimit;
		additionalKmFare = additionalDistance * pricing.additionalKmRate;
		firstKmDistance = pricing.firstKmLimit;
	}
	
	// Ensure proper decimal formatting
	firstKmFare = parseFloat(firstKmFare.toFixed(2));
	additionalKmFare = parseFloat(additionalKmFare.toFixed(2));
	
	const totalAmount = parseFloat((firstKmFare + additionalKmFare).toFixed(2));
	
	return {
		firstKmFare,
		additionalKmFare,
		totalAmount,
		estimatedDistance: Math.round(totalDistance),
		estimatedDuration: Math.round(totalDuration),
		breakdown: {
			firstKmRate: pricing.firstKmRate,
			additionalKmRate: pricing.additionalKmRate,
			totalDistance: parseFloat(distanceKm.toFixed(2)),
			firstKmDistance: parseFloat(firstKmDistance.toFixed(2)),
			additionalDistance: parseFloat(additionalDistance.toFixed(2)),
		},
		car: {
			id: car.id,
			name: car.name,
			firstKmRate: carPricing.firstKmRate,
		},
	};
}

