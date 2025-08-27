import type { DB } from "@/db";
import { z } from "zod";
import { getDistanceMatrix, calculateHaversineDistance } from "@/lib/google-maps";
import { eq, avg, and } from "drizzle-orm";
import { pricingConfig, cars } from "@/db/schema";

export const CalculateInstantQuoteSchema = z.object({
	originAddress: z.string().min(1, "Origin address is required"),
	destinationAddress: z.string().min(1, "Destination address is required"),
	originLatitude: z.number().optional(),
	originLongitude: z.number().optional(),
	destinationLatitude: z.number().optional(),
	destinationLongitude: z.number().optional(),
	carId: z.string().optional(),
	scheduledPickupTime: z.coerce.date().optional().default(new Date()),
	stops: z.array(z.object({
		address: z.string(),
		latitude: z.number().optional(),
		longitude: z.number().optional(),
		waitingTime: z.number().int().default(0), // in minutes
	})).optional(),
});

export type CalculateInstantQuoteParams = z.infer<typeof CalculateInstantQuoteSchema>;

export interface InstantQuote {
	baseFare: number;
	distanceFare: number;
	timeFare: number;
	extraCharges: number;
	totalAmount: number;
	estimatedDistance: number; // in meters
	estimatedDuration: number; // in seconds
	breakdown: {
		baseRate: number;
		perKmRate: number;
		perMinuteRate: number;
		minimumFare: number;
		surgePricing?: number;
		waitingTimeCharges?: number;
	};
}

export async function calculateInstantQuoteService(
	db: DB, 
	data: CalculateInstantQuoteParams,
	env?: { GOOGLE_MAPS_API_KEY?: string }
): Promise<InstantQuote> {
	let totalDistance = 0;
	let totalDuration = 0;
	let totalWaitingTime = 0;

	try {
		// Try to use Google Maps Distance Matrix API first
		const origins = [data.originAddress];
		const destinations = [data.destinationAddress];
		
		// Add stops if provided
		if (data.stops && data.stops.length > 0) {
			// Create a route: origin -> stops -> destination
			const waypoints = data.stops.map(stop => stop.address);
			
			// For multi-stop routes, we need to calculate each segment
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
					totalDistance += element.distance?.value || 0; // meters
					totalDuration += element.duration?.value || 0; // seconds
					totalWaitingTime += stop.waitingTime; // minutes
				}
				
				currentOrigin = stop.address;
			}
			
			// Final segment from last stop to destination
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
				totalDistance = element.distance?.value || 0; // meters
				totalDuration = element.duration?.value || 0; // seconds
			}
		}
	} catch (error) {
		console.warn("Google Maps API failed, using fallback calculation:", error);
		
		// Fallback to Haversine formula if coordinates are available
		if (data.originLatitude && data.originLongitude && 
			data.destinationLatitude && data.destinationLongitude) {
			
			const fallback = calculateHaversineDistance(
				data.originLatitude,
				data.originLongitude,
				data.destinationLatitude,
				data.destinationLongitude
			);
			
			totalDistance = fallback.distanceKm * 1000; // convert to meters
			totalDuration = fallback.durationSeconds;
		} else {
			// Last resort: estimate based on typical Australian city distances
			totalDistance = 15000; // 15km default
			totalDuration = 1800; // 30 minutes default
		}
	}

	// Get average base fare from car-specific pricing configurations for instant quote estimate
	const avgBaseFareResult = await db
		.select({ avgBaseFare: avg(pricingConfig.baseFare) })
		.from(pricingConfig)
		.innerJoin(cars, eq(cars.id, pricingConfig.carId))
		.where(
			and(
				eq(cars.isPublished, true),
				eq(cars.isActive, true),
				eq(cars.isAvailable, true),
				eq(pricingConfig.isActive, true)
			)
		);

	const averageBaseFare = Number(avgBaseFareResult[0]?.avgBaseFare);
	
	if (!averageBaseFare || averageBaseFare <= 0) {
		throw new Error("No published cars with active pricing configurations found. Please ensure at least one car is published and has active pricing configuration.");
	}

	// Get active pricing configuration from database (for other rates)
	const activePricingConfig = await db
		.select()
		.from(pricingConfig)
		.where(eq(pricingConfig.isActive, true))
		.limit(1);

	if (activePricingConfig.length === 0) {
		throw new Error("No active pricing configuration found. Please contact support or set up pricing configuration.");
	}

	const config = activePricingConfig[0];
	const pricing = {
		baseRate: averageBaseFare, // Use average car base fare as decimal
		perKmRate: config.pricePerKm, // Real value from database - no fallback
		perMinuteRate: config.pricePerMinute, // Real value from database - no fallback
		minimumFare: averageBaseFare, // Use average base fare as minimum
		waitingTimeRate: config.waitingChargePerMinute, // Real value from database - no fallback
	};

	// Apply surge pricing based on time of day
	const surgePricing = calculateSurgePricing(data.scheduledPickupTime);
	
	// Calculate fare components
	const baseFare = pricing.baseRate;
	const distanceKm = totalDistance / 1000; // convert meters to km
	const durationMinutes = totalDuration / 60; // convert seconds to minutes
	
	const distanceFare = parseFloat((distanceKm * pricing.perKmRate * surgePricing).toFixed(2));
	const timeFare = 0; // Time fare excluded from calculation
	const waitingTimeCharges = parseFloat((totalWaitingTime * pricing.waitingTimeRate).toFixed(2));
	
	let totalAmount = parseFloat((baseFare + distanceFare + waitingTimeCharges).toFixed(2));
	
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
		estimatedDistance: Math.round(totalDistance), // in meters
		estimatedDuration: Math.round(totalDuration), // in seconds
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

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
	const R = 6371; // Earth's radius in kilometers
	const dLat = toRadians(lat2 - lat1);
	const dLng = toRadians(lng2 - lng1);
	
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
		Math.sin(dLng / 2) * Math.sin(dLng / 2);
	
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c; // Distance in kilometers
}

function toRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
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