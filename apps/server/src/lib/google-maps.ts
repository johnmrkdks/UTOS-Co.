import { z } from "zod";

// Google Maps Distance Matrix response types
export const DistanceMatrixElementSchema = z.object({
	status: z.string(),
	duration: z.object({
		text: z.string(),
		value: z.number(), // in seconds
	}).optional(),
	distance: z.object({
		text: z.string(),
		value: z.number(), // in meters
	}).optional(),
});

export const DistanceMatrixRowSchema = z.object({
	elements: z.array(DistanceMatrixElementSchema),
});

export const DistanceMatrixResponseSchema = z.object({
	status: z.string(),
	origin_addresses: z.array(z.string()),
	destination_addresses: z.array(z.string()),
	rows: z.array(DistanceMatrixRowSchema),
});

export type DistanceMatrixResponse = z.infer<typeof DistanceMatrixResponseSchema>;

// Input validation schema
export const GetDistanceMatrixSchema = z.object({
	origins: z.array(z.string()).min(1).max(25), // Google limit
	destinations: z.array(z.string()).min(1).max(25), // Google limit
	mode: z.enum(["driving", "walking", "bicycling", "transit"]).default("driving"),
	units: z.enum(["metric", "imperial"]).default("metric"),
	avoidHighways: z.boolean().default(false),
	avoidTolls: z.boolean().default(false),
});

export type GetDistanceMatrixParams = z.infer<typeof GetDistanceMatrixSchema>;

// Service function to get distance matrix from Google Maps API
export async function getDistanceMatrix(
	params: GetDistanceMatrixParams,
	env?: { GOOGLE_MAPS_API_KEY?: string }
): Promise<DistanceMatrixResponse> {
	const { origins, destinations, mode, units, avoidHighways, avoidTolls } = params;
	
	const apiKey = env?.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
	if (!apiKey) {
		throw new Error("Google Maps API key not configured");
	}

	const baseUrl = "https://maps.googleapis.com/maps/api/distancematrix/json";
	const queryParams = new URLSearchParams({
		origins: origins.join("|"),
		destinations: destinations.join("|"),
		mode,
		units,
		key: apiKey,
		region: "AU", // Bias towards Australia
	});

	if (avoidHighways) {
		queryParams.append("avoid", "highways");
	}
	if (avoidTolls) {
		queryParams.append("avoid", "tolls");
	}

	const url = `${baseUrl}?${queryParams.toString()}`;
	
	try {
		const response = await fetch(url);
		
		if (!response.ok) {
			throw new Error(`Google Maps API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		
		// Validate the response
		const validatedResponse = DistanceMatrixResponseSchema.parse(data);
		
		if (validatedResponse.status !== "OK") {
			throw new Error(`Google Maps API returned status: ${validatedResponse.status}`);
		}

		return validatedResponse;
	} catch (error) {
		console.error("Error calling Google Maps Distance Matrix API:", error);
		throw error;
	}
}

// Helper function to calculate distance using coordinates (fallback)
export function calculateHaversineDistance(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number
): { distanceKm: number; durationSeconds: number } {
	const R = 6371; // Earth's radius in kilometers
	const dLat = toRadians(lat2 - lat1);
	const dLng = toRadians(lng2 - lng1);
	
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
		Math.sin(dLng / 2) * Math.sin(dLng / 2);
	
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distanceKm = R * c;
	
	// Estimate duration assuming average speed of 40 km/h in urban areas
	const durationSeconds = Math.round((distanceKm / 40) * 3600);
	
	return {
		distanceKm,
		durationSeconds,
	};
}

function toRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}

// Helper to extract coordinates from Google Place geometry
export function extractCoordinatesFromGeometry(geometry: any): { lat: number; lng: number } | null {
	if (!geometry?.location) return null;
	
	// Handle both Google Maps API response formats
	const lat = typeof geometry.location.lat === 'function' 
		? geometry.location.lat() 
		: geometry.location.lat;
	const lng = typeof geometry.location.lng === 'function' 
		? geometry.location.lng() 
		: geometry.location.lng;
		
	if (typeof lat !== 'number' || typeof lng !== 'number') return null;
	
	return { lat, lng };
}