import {
	calculateInstantQuoteService,
	CalculateInstantQuoteSchema,
} from "@/services/bookings/calculate-instant-quote";
import {
	calculateCarSpecificQuoteService,
	CalculateCarSpecificQuoteSchema,
} from "@/services/bookings/calculate-car-specific-quote";
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

// In-memory quote storage (in production, use Redis or database)
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
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				// Clean expired quotes periodically
				cleanExpiredQuotes();
				
				const quote = await calculateInstantQuoteService(db, input, env);
				
				// Generate secure token for quote
				const quoteToken = generateSecureToken();
				
				// Store quote data securely (expires in 1 hour)
				quoteStorage.set(quoteToken, {
					quote,
					routeData: {
						originAddress: input.originAddress,
						destinationAddress: input.destinationAddress,
						originLatitude: input.originLatitude,
						originLongitude: input.originLongitude,
						destinationLatitude: input.destinationLatitude,
						destinationLongitude: input.destinationLongitude,
						stops: input.stops || [],
					},
					expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
				});
				
				return {
					...quote,
					quoteToken // Return secure token instead of exposing all data in URL
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
	
	getQuoteByToken: publicProcedure
		.input(z.object({
			quoteToken: z.string().min(1, "Quote token is required")
		}))
		.query(async ({ input }) => {
			try {
				// Clean expired quotes periodically
				cleanExpiredQuotes();
				
				const quoteData = quoteStorage.get(input.quoteToken);
				
				if (!quoteData) {
					throw new Error("Quote not found or expired. Please generate a new quote.");
				}
				
				if (quoteData.expiresAt < Date.now()) {
					quoteStorage.delete(input.quoteToken);
					throw new Error("Quote has expired. Please generate a new quote.");
				}
				
				return {
					quote: quoteData.quote,
					routeData: quoteData.routeData
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