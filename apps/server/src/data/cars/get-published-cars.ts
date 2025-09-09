import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { Car } from "@/schemas/shared";
import { eq, and } from "drizzle-orm";
import { CarStatusEnum } from "@/types";

export async function getPublishedCars(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: (opts?: any) => db.query.cars.findMany({
			...opts,
			where: opts?.where ? and(
				eq(cars.isPublished, true),
				eq(cars.isActive, true),
				eq(cars.isAvailable, true),
				eq(cars.status, CarStatusEnum.Available),
				opts.where
			) : and(
				eq(cars.isPublished, true),
				eq(cars.isActive, true),
				eq(cars.isAvailable, true),
				eq(cars.status, CarStatusEnum.Available)
			),
			with: {
				model: {
					with: {
						brand: true
					}
				},
				category: true,
				bodyType: true,
				fuelType: true,
				transmissionType: true,
				driveType: true,
				conditionType: true,
				images: true,
				carsToFeatures: {
					with: {
						feature: true
					}
				}
			}
		}),
		filterBuilder: new RQBFilterBuilder(cars),
		queryType: "rqb",
	};

	return await filterPaginationSort<Car>(queryBuilder, options);
}