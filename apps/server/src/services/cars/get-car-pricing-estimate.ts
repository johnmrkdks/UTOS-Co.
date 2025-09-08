import type { DB } from "@/db";
import { pricingConfig, cars } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";

export const GetCarPricingEstimateSchema = z.object({
	carId: z.string(),
});

export type GetCarPricingEstimateParams = z.infer<typeof GetCarPricingEstimateSchema>;

export interface CarPricingEstimate {
	firstKmRate: number;
	firstKmLimit: number;
	additionalKmRate: number;
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
			.where(eq(pricingConfig.carId, data.carId))
			.limit(1);

		if (carPricingResult.length === 0) {
			// No specific pricing for this car, try to get global pricing
			const globalPricingResult = await db
				.select()
				.from(pricingConfig)
				.where(isNull(pricingConfig.carId)) // Global pricing has null carId
				.limit(1);

			if (globalPricingResult.length === 0) {
				return null; // No pricing available
			}

			const globalConfig = globalPricingResult[0];
			return {
				firstKmRate: globalConfig.firstKmRate,
				firstKmLimit: globalConfig.firstKmLimit || 10,
				additionalKmRate: globalConfig.pricePerKm,
				estimatedDailyRate: calculateEstimatedDailyRate(globalConfig.firstKmRate, globalConfig.firstKmLimit || 10, globalConfig.pricePerKm),
				hasActivePricing: true,
			};
		}

		const config = carPricingResult[0];
		return {
			firstKmRate: config.firstKmRate,
			firstKmLimit: config.firstKmLimit || 10,
			additionalKmRate: config.pricePerKm,
			estimatedDailyRate: calculateEstimatedDailyRate(config.firstKmRate, config.firstKmLimit || 10, config.pricePerKm),
			hasActivePricing: true,
		};
	} catch (error) {
		console.error("Error getting car pricing estimate:", error);
		return null;
	}
}

// Daily rate estimation using simplified two-tier pricing model
function calculateEstimatedDailyRate(firstKmRate: number, firstKmLimit: number, additionalKmRate: number): number {
	const averageDailyKm = 100; // Assumption for daily usage
	
	// Calculate using simplified two-tier pricing model
	let firstKmFare = 0;
	let additionalKmFare = 0;
	
	if (averageDailyKm <= firstKmLimit) {
		// Distance is within first tier - pay flat rate
		firstKmFare = firstKmRate;
	} else {
		// Distance exceeds first tier - flat rate + additional per km
		firstKmFare = firstKmRate;
		const additionalDistance = averageDailyKm - firstKmLimit;
		additionalKmFare = additionalDistance * additionalKmRate;
	}
	
	return parseFloat((firstKmFare + additionalKmFare).toFixed(2));
}