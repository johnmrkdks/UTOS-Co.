import type { DB } from "@/db";
import { z } from "zod";
import { getDistanceMatrix, calculateHaversineDistance } from "@/lib/google-maps";
import { eq, avg, and, isNull } from "drizzle-orm";
import { pricingConfig, cars } from "@/db/schema";
import { storeSecureQuote, type SecureQuoteData } from "@/services/quotes/instant-quote-storage";

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
	firstKmFare: number;
	additionalKmFare: number;
	totalAmount: number;
	estimatedDistance: number; // in kilometers with decimal precision
	estimatedDuration: number; // in seconds
	breakdown: {
		firstKmRate: number;
		additionalKmRate: number;
		totalDistance: number; // in km
		firstKmDistance: number; // distance charged at first km rate
		additionalDistance: number; // distance charged at per km rate
	};
}

export interface SecureInstantQuote extends InstantQuote {
	quoteId: string; // Secure reference to stored quote
}

export async function calculateInstantQuoteService(
	db: DB,
	data: CalculateInstantQuoteParams,
	env?: { GOOGLE_MAPS_API_KEY?: string }
): Promise<InstantQuote> {
	console.log("🔍 calculateInstantQuoteService - Starting calculation");
	console.log("🔍 calculateInstantQuoteService - Input data:", JSON.stringify(data, null, 2));
	console.log("🔍 calculateInstantQuoteService - Environment:", !!env?.GOOGLE_MAPS_API_KEY ? "Google Maps API key available" : "No Google Maps API key");

	let totalDistance = 0;
	let totalDuration = 0;
	let totalWaitingTime = 0;

	try {
		console.log("🔍 calculateInstantQuoteService - Attempting Google Maps API call");
		// Try to use Google Maps Distance Matrix API first
		const origins = [data.originAddress];
		const destinations = [data.destinationAddress];
		console.log("🔍 calculateInstantQuoteService - Origins:", origins);
		console.log("🔍 calculateInstantQuoteService - Destinations:", destinations);
		
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
		console.log("🔍 calculateInstantQuoteService - Google Maps API successful");
		console.log("🔍 calculateInstantQuoteService - Total distance:", totalDistance, "meters");
		console.log("🔍 calculateInstantQuoteService - Total duration:", totalDuration, "seconds");
	} catch (error) {
		console.error("❌ calculateInstantQuoteService - Google Maps API failed:", error);
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

	// Get pricing configuration - use car-specific if carId provided, otherwise use general config
	console.log("🔍 calculateInstantQuoteService - Fetching pricing configuration");
	console.log("🔍 calculateInstantQuoteService - Car ID provided:", data.carId);

	let pricingConfigResult;

	if (data.carId) {
		console.log("🔍 calculateInstantQuoteService - Looking for car-specific pricing");
		// Try to get car-specific pricing configuration first
		pricingConfigResult = await db
			.select()
			.from(pricingConfig)
			.where(eq(pricingConfig.carId, data.carId))
			.limit(1);

		console.log("🔍 calculateInstantQuoteService - Car-specific pricing results:", pricingConfigResult.length);

		// If no car-specific pricing exists, fallback to global pricing configuration
		if (pricingConfigResult.length === 0) {
			console.log(`No car-specific pricing found for car ${data.carId}, using global pricing configuration`);
			pricingConfigResult = await db
				.select()
				.from(pricingConfig)
				.where(isNull(pricingConfig.carId)) // Global pricing config
				.limit(1);
		}

		// If still no pricing config found, try any pricing config as last resort
		if (pricingConfigResult.length === 0) {
			console.log(`No global pricing found, using any pricing configuration as fallback`);
			pricingConfigResult = await db
				.select()
				.from(pricingConfig)
				.limit(1);
		}
	} else {
		console.log("🔍 calculateInstantQuoteService - No car ID provided, using first available pricing configuration");
		// No carId provided, use first available pricing configuration
		pricingConfigResult = await db
			.select()
			.from(pricingConfig)
			.limit(1);
	}

	console.log("🔍 calculateInstantQuoteService - Final pricing config results:", pricingConfigResult.length);

	if (pricingConfigResult.length === 0) {
		console.error("❌ calculateInstantQuoteService - No pricing configuration found");
		throw new Error("No pricing configuration found. Please contact support or set up pricing configuration.");
	}

	const config = pricingConfigResult[0];
	console.log("🔍 calculateInstantQuoteService - Using pricing config:", {
		id: config.id,
		firstKmRate: config.firstKmRate,
		pricePerKm: config.pricePerKm,
		firstKmLimit: config.firstKmLimit,
		carId: config.carId
	});
	const pricing = {
		firstKmRate: config.firstKmRate,
		additionalKmRate: config.pricePerKm,
		firstKmLimit: config.firstKmLimit || 10,
	};

	// Calculate fare components using flexible pricing model
	const distanceKm = totalDistance / 1000; // convert meters to km
	
	// Calculate using simplified two-tier pricing model
	let firstKmFare = 0;
	let additionalKmFare = 0;
	let firstKmDistance = 0;
	let additionalDistance = 0;
	
	if (distanceKm <= pricing.firstKmLimit) {
		// Distance is within first tier - pay flat rate
		firstKmFare = parseFloat(pricing.firstKmRate.toFixed(2));
		firstKmDistance = distanceKm; // Record actual distance for breakdown
		additionalDistance = 0;
	} else {
		// Distance exceeds first tier - flat rate + additional per km
		firstKmFare = parseFloat(pricing.firstKmRate.toFixed(2));
		additionalDistance = distanceKm - pricing.firstKmLimit;
		additionalKmFare = parseFloat((additionalDistance * pricing.additionalKmRate).toFixed(2));
		firstKmDistance = pricing.firstKmLimit;
	}
	
	const totalAmount = parseFloat((firstKmFare + additionalKmFare).toFixed(2));

	console.log("🔍 calculateInstantQuoteService - Final calculation results:", {
		distanceKm,
		firstKmDistance,
		additionalDistance,
		firstKmFare,
		additionalKmFare,
		totalAmount,
		estimatedDistance: parseFloat((totalDistance / 1000).toFixed(3)),
		estimatedDuration: Math.round(totalDuration)
	});

	const finalQuote = {
		firstKmFare,
		additionalKmFare,
		totalAmount,
		estimatedDistance: parseFloat((totalDistance / 1000).toFixed(3)), // Convert meters to kilometers with 3 decimal precision
		estimatedDuration: Math.round(totalDuration), // in seconds
		breakdown: {
			firstKmRate: pricing.firstKmRate,
			additionalKmRate: pricing.additionalKmRate,
			totalDistance: parseFloat(distanceKm.toFixed(2)),
			firstKmDistance: parseFloat(firstKmDistance.toFixed(2)),
			additionalDistance: parseFloat(additionalDistance.toFixed(2)),
		},
	};

	console.log("✅ calculateInstantQuoteService - Returning quote successfully");
	return finalQuote;
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


/**
 * Calculate instant quote and store securely for booking conversion
 * Returns quote data with secure reference ID
 */
export async function calculateAndStoreSecureQuote(
	db: DB, 
	data: CalculateInstantQuoteParams,
	env?: { GOOGLE_MAPS_API_KEY?: string },
	clientInfo?: { ip?: string; userAgent?: string }
): Promise<SecureInstantQuote> {
	// Calculate the quote using the existing service
	const quote = await calculateInstantQuoteService(db, data, env);
	
	// Prepare secure quote data for storage
	const secureQuoteData: SecureQuoteData = {
		originAddress: data.originAddress,
		destinationAddress: data.destinationAddress,
		originLatitude: data.originLatitude,
		originLongitude: data.originLongitude,
		destinationLatitude: data.destinationLatitude,
		destinationLongitude: data.destinationLongitude,
		stops: data.stops,
		carId: data.carId,
		firstKmFare: quote.firstKmFare,
		additionalKmFare: quote.additionalKmFare,
		totalAmount: quote.totalAmount,
		estimatedDistance: quote.estimatedDistance,
		estimatedDuration: quote.estimatedDuration,
		breakdown: quote.breakdown,
		scheduledPickupTime: data.scheduledPickupTime,
	};
	
	// Store the quote securely and get the reference ID
	const quoteId = await storeSecureQuote(db, secureQuoteData, clientInfo);
	
	// Return quote with secure reference
	return {
		...quote,
		quoteId,
	};
}