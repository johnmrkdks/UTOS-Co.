import { and, asc, eq, gt, isNotNull } from "drizzle-orm";
import type { DB } from "@/db";
import { cars, pricingConfig } from "@/db/schema";
import { CarStatusEnum } from "@/types";

export type PublishedCarHourlyRow = {
	id: string;
	name: string;
	hourlyRate: number;
};

/** Published cars that have a positive hourly rate in pricing config (instant quote hourly). */
export async function getPublishedCarsWithHourlyPricingService(
	db: DB,
): Promise<PublishedCarHourlyRow[]> {
	const rows = await db
		.select({
			id: cars.id,
			name: cars.name,
			hourlyRate: pricingConfig.hourlyRate,
		})
		.from(cars)
		.innerJoin(pricingConfig, eq(pricingConfig.carId, cars.id))
		.where(
			and(
				eq(cars.isPublished, true),
				eq(cars.isActive, true),
				eq(cars.isAvailable, true),
				eq(cars.status, CarStatusEnum.Available),
				isNotNull(pricingConfig.hourlyRate),
				gt(pricingConfig.hourlyRate, 0),
			),
		)
		.orderBy(asc(cars.name));

	return rows
		.filter(
			(r): r is PublishedCarHourlyRow & { hourlyRate: number } =>
				typeof r.hourlyRate === "number" && r.hourlyRate > 0,
		)
		.map((r) => ({
			id: r.id,
			name: r.name,
			hourlyRate: r.hourlyRate,
		}));
}
