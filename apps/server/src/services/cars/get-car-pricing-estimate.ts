import type { DB } from "@/db";
import { pricingConfig, cars } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export const GetCarPricingEstimateSchema = z.object({
	carId: z.string(),
});

export type GetCarPricingEstimateParams = z.infer<typeof GetCarPricingEstimateSchema>;

export interface CarPricingEstimate {
	baseFare: number;
	perKmRate: number;
	estimatedDailyRate?: number; // rough daily estimate
	hasActivePricing: boolean;
}

export async function getCarPricingEstimateService(
	db: DB, 
	data: GetCarPricingEstimateParams
): Promise<CarPricingEstimate | null> {
	try {
		// Get pricing configuration for this specific car
		const carPricingResult = await db
			.select()
			.from(pricingConfig)
			.where(
				and(
					eq(pricingConfig.carId, data.carId),
					eq(pricingConfig.isActive, true)
				)
			)
			.limit(1);

		if (carPricingResult.length === 0) {
			// No specific pricing for this car, try to get global pricing
			const globalPricingResult = await db
				.select()
				.from(pricingConfig)
				.where(
					and(
						eq(pricingConfig.carId, null), // Global pricing has null carId
						eq(pricingConfig.isActive, true)
					)
				)
				.limit(1);

			if (globalPricingResult.length === 0) {
				return null; // No pricing available
			}

			const globalConfig = globalPricingResult[0];
			return {
				baseFare: globalConfig.baseFare,
				perKmRate: globalConfig.pricePerKm,
				estimatedDailyRate: calculateEstimatedDailyRate(globalConfig.baseFare, globalConfig.pricePerKm),
				hasActivePricing: true,
			};
		}

		const config = carPricingResult[0];
		return {
			baseFare: config.baseFare,
			perKmRate: config.pricePerKm,
			estimatedDailyRate: calculateEstimatedDailyRate(config.baseFare, config.pricePerKm),
			hasActivePricing: true,
		};
	} catch (error) {
		console.error("Error getting car pricing estimate:", error);
		return null;
	}
}

// Simple daily rate estimation: base fare + average daily distance (100km)
function calculateEstimatedDailyRate(baseFare: number, perKmRate: number): number {
	const averageDailyKm = 100; // Assumption for daily usage
	return baseFare + (averageDailyKm * perKmRate);
}