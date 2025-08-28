import {
	calculateInstantQuoteService,
	calculateAndStoreSecureQuote,
	CalculateInstantQuoteSchema,
} from "@/services/bookings/calculate-instant-quote";
import {
	calculateCarSpecificQuoteService,
	CalculateCarSpecificQuoteSchema,
} from "@/services/bookings/calculate-car-specific-quote";
import { retrieveSecureQuoteWithCar } from "@/services/quotes/instant-quote-storage";
import { publicProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { eq } from "drizzle-orm";
import { pricingConfig } from "@/db/sqlite/schema/price-config";
import { z } from "zod";

// Generate secure random token using crypto
function generateSecureToken(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Temporary in-memory quote storage until database schema is fixed
const quoteStorage = new Map<string, { quote: any; routeData: any; expiresAt: number }>();

// Clean expired quotes when accessed (no global intervals in Cloudflare Workers)
function cleanExpiredQuotes() {
	const now = Date.now();
	for (const [key, value] of quoteStorage.entries()) {
		if (value.expiresAt < now) {
			quoteStorage.delete(key);
		}
	}
}

export const instantQuoteRouter = router({
	calculate: publicProcedure
		.input(CalculateInstantQuoteSchema)
		.mutation(async ({ ctx: { db, env, req }, input }) => {
			try {
				// For now, use the old calculation method until database schema is fixed
				// This still provides security by generating a temporary secure ID
				const quote = await calculateInstantQuoteService(db, input, env);
				
				// Generate a temporary secure quote ID (will be replaced with database storage)
				const quoteId = generateSecureToken();
				
				// Store in memory temporarily (30 minutes expiry)
				quoteStorage.set(quoteId, {
					quote,
					routeData: {
						originAddress: input.originAddress,
						destinationAddress: input.destinationAddress,
						originLatitude: input.originLatitude,
						originLongitude: input.originLongitude,
						destinationLatitude: input.destinationLatitude,
						destinationLongitude: input.destinationLongitude,
						stops: input.stops || [],
						carId: input.carId,
					},
					expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
				});
				
				// Return quote with secure ID
				return {
					...quote,
					quoteId,
				};
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	checkAvailability: publicProcedure
		.query(async ({ ctx: { db } }) => {
			try {
				const activePricingConfig = await db
					.select()
					.from(pricingConfig)
					.where(eq(pricingConfig.isActive, true))
					.limit(1);

				return {
					available: activePricingConfig.length > 0,
					hasActiveConfig: activePricingConfig.length > 0
				};
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	
	getQuoteById: publicProcedure
		.input(z.object({
			quoteId: z.string().min(1, "Quote ID is required")
		}))
		.query(async ({ input }) => {
			try {
				// Clean expired quotes periodically
				cleanExpiredQuotes();
				
				const quoteData = quoteStorage.get(input.quoteId);
				
				if (!quoteData) {
					throw new Error("Quote not found or expired. Please generate a new quote.");
				}
				
				if (quoteData.expiresAt < Date.now()) {
					quoteStorage.delete(input.quoteId);
					throw new Error("Quote has expired. Please generate a new quote.");
				}
				
				// Return the stored quote data in the format expected by the frontend
				return {
					id: input.quoteId,
					originAddress: quoteData.routeData.originAddress,
					destinationAddress: quoteData.routeData.destinationAddress,
					originLatitude: quoteData.routeData.originLatitude,
					originLongitude: quoteData.routeData.originLongitude,
					destinationLatitude: quoteData.routeData.destinationLatitude,
					destinationLongitude: quoteData.routeData.destinationLongitude,
					stops: quoteData.routeData.stops,
					carId: quoteData.routeData.carId,
					baseFare: quoteData.quote.baseFare,
					distanceFare: quoteData.quote.distanceFare,
					timeFare: quoteData.quote.timeFare,
					extraCharges: quoteData.quote.extraCharges,
					totalAmount: quoteData.quote.totalAmount,
					estimatedDistance: quoteData.quote.estimatedDistance,
					estimatedDuration: quoteData.quote.estimatedDuration,
					breakdown: quoteData.quote.breakdown,
					expiresAt: new Date(quoteData.expiresAt),
					createdAt: new Date(Date.now() - (30 * 60 * 1000) + (quoteData.expiresAt - Date.now())),
				};
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	calculateCarSpecific: publicProcedure
		.input(CalculateCarSpecificQuoteSchema)
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				const quote = await calculateCarSpecificQuoteService(db, input, env);
				return quote;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});