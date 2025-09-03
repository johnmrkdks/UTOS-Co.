import type { DB } from "@/db";
import { instantQuotes } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export interface SecureQuoteData {
	// Route information
	originAddress: string;
	destinationAddress: string;
	originLatitude?: number;
	originLongitude?: number;
	destinationLatitude?: number;
	destinationLongitude?: number;
	stops?: Array<{
		address: string;
		latitude?: number;
		longitude?: number;
		waitingTime?: number;
	}>;
	
	// Selected car
	carId?: string;
	
	// Quote calculations
	baseFare: number;
	distanceFare: number;
	timeFare: number;
	extraCharges: number;
	totalAmount: number;
	
	// Trip metrics
	estimatedDistance: number; // in meters
	estimatedDuration: number; // in seconds
	
	// Pricing breakdown for transparency
	breakdown: {
		baseRate: number;
		perKmRate: number;
		perMinuteRate: number;
		minimumFare: number;
		surgePricing?: number;
		waitingTimeCharges?: number;
	};
	
	// Quote metadata
	surgePricing?: number;
	scheduledPickupTime?: Date;
}

export interface StoredQuoteData extends SecureQuoteData {
	id: string;
	expiresAt: Date;
	createdAt: Date;
	car?: {
		id: string;
		name: string;
		brandName: string;
		modelName: string;
		categoryName: string;
		passengerCapacity: number;
		imageUrl?: string;
	};
}

/**
 * Store a secure quote in the database
 * Quotes expire after 30 minutes for security
 */
export async function storeSecureQuote(
	db: DB,
	quoteData: SecureQuoteData,
	clientInfo?: { ip?: string; userAgent?: string }
): Promise<string> {
	const quoteId = createId();
	const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
	
	await db.insert(instantQuotes).values({
		id: quoteId,
		originAddress: quoteData.originAddress,
		destinationAddress: quoteData.destinationAddress,
		originLatitude: quoteData.originLatitude,
		originLongitude: quoteData.originLongitude,
		destinationLatitude: quoteData.destinationLatitude,
		destinationLongitude: quoteData.destinationLongitude,
		stops: quoteData.stops ? JSON.stringify(quoteData.stops) : null,
		carId: quoteData.carId,
		baseFare: quoteData.baseFare,
		distanceFare: quoteData.distanceFare,
		timeFare: quoteData.timeFare,
		extraCharges: quoteData.extraCharges,
		totalAmount: quoteData.totalAmount,
		estimatedDistance: quoteData.estimatedDistance,
		estimatedDuration: quoteData.estimatedDuration,
		breakdown: JSON.stringify(quoteData.breakdown),
		surgePricing: quoteData.surgePricing,
		scheduledPickupTime: quoteData.scheduledPickupTime || new Date(),
		expiresAt: expiresAt,
		clientIp: clientInfo?.ip,
		userAgent: clientInfo?.userAgent,
	});
	
	return quoteId;
}

/**
 * Retrieve a secure quote by ID
 * Returns null if quote doesn't exist or has expired
 */
export async function retrieveSecureQuote(
	db: DB,
	quoteId: string
): Promise<StoredQuoteData | null> {
	const result = await db
		.select({
			// Quote data
			id: instantQuotes.id,
			originAddress: instantQuotes.originAddress,
			destinationAddress: instantQuotes.destinationAddress,
			originLatitude: instantQuotes.originLatitude,
			originLongitude: instantQuotes.originLongitude,
			destinationLatitude: instantQuotes.destinationLatitude,
			destinationLongitude: instantQuotes.destinationLongitude,
			stops: instantQuotes.stops,
			carId: instantQuotes.carId,
			baseFare: instantQuotes.baseFare,
			distanceFare: instantQuotes.distanceFare,
			timeFare: instantQuotes.timeFare,
			extraCharges: instantQuotes.extraCharges,
			totalAmount: instantQuotes.totalAmount,
			estimatedDistance: instantQuotes.estimatedDistance,
			estimatedDuration: instantQuotes.estimatedDuration,
			breakdown: instantQuotes.breakdown,
			surgePricing: instantQuotes.surgePricing,
			scheduledPickupTime: instantQuotes.scheduledPickupTime,
			expiresAt: instantQuotes.expiresAt,
			createdAt: instantQuotes.createdAt,
		})
		.from(instantQuotes)
		.where(
			and(
				eq(instantQuotes.id, quoteId),
				gt(instantQuotes.expiresAt, new Date()) // Only return non-expired quotes
			)
		)
		.limit(1);
	
	if (!result.length) {
		return null;
	}
	
	const quote = result[0];
	
	// Parse JSON fields
	const stops = quote.stops ? JSON.parse(quote.stops as string) : undefined;
	const breakdown = JSON.parse(quote.breakdown as string);
	
	return {
		id: quote.id,
		originAddress: quote.originAddress,
		destinationAddress: quote.destinationAddress,
		originLatitude: quote.originLatitude || undefined,
		originLongitude: quote.originLongitude || undefined,
		destinationLatitude: quote.destinationLatitude || undefined,
		destinationLongitude: quote.destinationLongitude || undefined,
		stops,
		carId: quote.carId || undefined,
		baseFare: quote.baseFare,
		distanceFare: quote.distanceFare,
		timeFare: quote.timeFare,
		extraCharges: quote.extraCharges,
		totalAmount: quote.totalAmount,
		estimatedDistance: quote.estimatedDistance,
		estimatedDuration: quote.estimatedDuration,
		breakdown,
		surgePricing: quote.surgePricing || undefined,
		scheduledPickupTime: quote.scheduledPickupTime || undefined,
		expiresAt: quote.expiresAt,
		createdAt: quote.createdAt,
	};
}

/**
 * Retrieve a secure quote with car details
 */
export async function retrieveSecureQuoteWithCar(
	db: DB,
	quoteId: string
): Promise<StoredQuoteData | null> {
	const result = await db
		.select({
			// Quote data
			id: instantQuotes.id,
			originAddress: instantQuotes.originAddress,
			destinationAddress: instantQuotes.destinationAddress,
			originLatitude: instantQuotes.originLatitude,
			originLongitude: instantQuotes.originLongitude,
			destinationLatitude: instantQuotes.destinationLatitude,
			destinationLongitude: instantQuotes.destinationLongitude,
			stops: instantQuotes.stops,
			carId: instantQuotes.carId,
			baseFare: instantQuotes.baseFare,
			distanceFare: instantQuotes.distanceFare,
			timeFare: instantQuotes.timeFare,
			extraCharges: instantQuotes.extraCharges,
			totalAmount: instantQuotes.totalAmount,
			estimatedDistance: instantQuotes.estimatedDistance,
			estimatedDuration: instantQuotes.estimatedDuration,
			breakdown: instantQuotes.breakdown,
			surgePricing: instantQuotes.surgePricing,
			scheduledPickupTime: instantQuotes.scheduledPickupTime,
			expiresAt: instantQuotes.expiresAt,
			createdAt: instantQuotes.createdAt,
			// Car data (we'll need to join with cars table when implementing)
		})
		.from(instantQuotes)
		.where(
			and(
				eq(instantQuotes.id, quoteId),
				gt(instantQuotes.expiresAt, new Date()) // Only return non-expired quotes
			)
		)
		.limit(1);
	
	if (!result.length) {
		return null;
	}
	
	const quote = result[0];
	
	// Parse JSON fields
	const stops = quote.stops ? JSON.parse(quote.stops as string) : undefined;
	const breakdown = JSON.parse(quote.breakdown as string);
	
	return {
		id: quote.id,
		originAddress: quote.originAddress,
		destinationAddress: quote.destinationAddress,
		originLatitude: quote.originLatitude || undefined,
		originLongitude: quote.originLongitude || undefined,
		destinationLatitude: quote.destinationLatitude || undefined,
		destinationLongitude: quote.destinationLongitude || undefined,
		stops,
		carId: quote.carId || undefined,
		baseFare: quote.baseFare,
		distanceFare: quote.distanceFare,
		timeFare: quote.timeFare,
		extraCharges: quote.extraCharges,
		totalAmount: quote.totalAmount,
		estimatedDistance: quote.estimatedDistance,
		estimatedDuration: quote.estimatedDuration,
		breakdown,
		surgePricing: quote.surgePricing || undefined,
		scheduledPickupTime: quote.scheduledPickupTime || undefined,
		expiresAt: quote.expiresAt,
		createdAt: quote.createdAt,
		// TODO: Add car details when implementing the join
	};
}

/**
 * Clean up expired quotes (can be run as a background job)
 */
export async function cleanupExpiredQuotes(db: DB): Promise<number> {
	const result = await db
		.delete(instantQuotes)
		.where(
			gt(new Date(), instantQuotes.expiresAt)
		);
	
	return result.changes || 0;
}