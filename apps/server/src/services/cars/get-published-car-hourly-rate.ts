import { and, eq, gt, isNotNull } from "drizzle-orm";
import type { DB } from "@/db";
import { cars, pricingConfig } from "@/db/schema";
import { CarStatusEnum } from "@/types";

/** Hourly rate from pricing config for a published car, or null if none. */
export async function getPublishedCarHourlyRateService(
	db: DB,
	carId: string,
): Promise<number | null> {
	const row = await db
		.select({ hourlyRate: pricingConfig.hourlyRate })
		.from(cars)
		.innerJoin(pricingConfig, eq(pricingConfig.carId, cars.id))
		.where(
			and(
				eq(cars.id, carId),
				eq(cars.isPublished, true),
				eq(cars.isActive, true),
				eq(cars.isAvailable, true),
				eq(cars.status, CarStatusEnum.Available),
				isNotNull(pricingConfig.hourlyRate),
				gt(pricingConfig.hourlyRate, 0),
			),
		)
		.limit(1);

	const rate = row[0]?.hourlyRate;
	return typeof rate === "number" && rate > 0 ? rate : null;
}
