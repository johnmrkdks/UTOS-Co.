import {
	calculateInstantQuoteService,
	CalculateInstantQuoteSchema,
} from "@/services/bookings/calculate-instant-quote";
import { publicProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { eq } from "drizzle-orm";
import { pricingConfig } from "@/db/sqlite/schema/price-config";

export const instantQuoteRouter = router({
	calculate: publicProcedure
		.input(CalculateInstantQuoteSchema)
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				const quote = await calculateInstantQuoteService(db, input, env);
				return quote;
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
});