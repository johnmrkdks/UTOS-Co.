import type { DB } from "@/db";
import { z } from "zod";

export const CalculateInstantQuoteSchema = z.object({
	originLatitude: z.number(),
	originLongitude: z.number(),
	destinationLatitude: z.number(),
	destinationLongitude: z.number(),
	carId: z.string(),
	scheduledPickupTime: z.date(),
	stops: z.array(z.object({
		latitude: z.number(),
		longitude: z.number(),
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
	data: CalculateInstantQuoteParams
): Promise<InstantQuote> {
	// Calculate distance using Haversine formula
	const distance = calculateDistance(
		data.originLatitude,
		data.originLongitude,
		data.destinationLatitude,
		data.destinationLongitude
	);
	
	// Add distance for stops if provided
	let totalDistance = distance;
	let totalWaitingTime = 0;
	
	if (data.stops && data.stops.length > 0) {
		let currentLat = data.originLatitude;
		let currentLng = data.originLongitude;
		
		for (const stop of data.stops) {
			totalDistance += calculateDistance(currentLat, currentLng, stop.latitude, stop.longitude);
			totalWaitingTime += stop.waitingTime;
			currentLat = stop.latitude;
			currentLng = stop.longitude;
		}
		
		// Distance from last stop to destination
		totalDistance += calculateDistance(
			currentLat,
			currentLng,
			data.destinationLatitude,
			data.destinationLongitude
		);
	}
	
	// Base pricing configuration (these should be configurable in the database)
	const pricing = {
		baseRate: 500, // $5.00 in cents
		perKmRate: 150, // $1.50 per km in cents
		perMinuteRate: 50, // $0.50 per minute in cents
		minimumFare: 1000, // $10.00 minimum in cents
		waitingTimeRate: 100, // $1.00 per minute in cents
	};
	
	// Calculate estimated duration (assuming average speed of 30 km/h in city)
	const estimatedDurationHours = totalDistance / 30; // in hours
	const estimatedDurationMinutes = estimatedDurationHours * 60; // in minutes
	const estimatedDurationSeconds = estimatedDurationMinutes * 60; // in seconds
	
	// Apply surge pricing based on time of day
	const surgePricing = calculateSurgePricing(data.scheduledPickupTime);
	
	// Calculate fare components
	const baseFare = pricing.baseRate;
	const distanceFare = Math.round(totalDistance * pricing.perKmRate * surgePricing);
	const timeFare = Math.round(estimatedDurationMinutes * pricing.perMinuteRate * surgePricing);
	const waitingTimeCharges = totalWaitingTime * pricing.waitingTimeRate;
	
	let totalAmount = baseFare + distanceFare + timeFare + waitingTimeCharges;
	
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
		estimatedDistance: Math.round(totalDistance * 1000), // convert to meters
		estimatedDuration: Math.round(estimatedDurationSeconds),
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