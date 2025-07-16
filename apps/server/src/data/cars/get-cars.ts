import type { DB } from "@/db";
import { cars } from "@/db/schema";
import type { BaseQueryParams, QueryResult } from "@/schemas/query";
import type { Car } from "@/schemas/tables/car";

type GetCarsParams = BaseQueryParams;

export async function getCars(
	db: DB,
	params: GetCarsParams,
): Promise<QueryResult<Car[]>> {
	const records = await db.select().from(cars);

	return {
		data: records,
		pagination: {
			page: params.pagination.page,
			limit: params.pagination.limit,
			total: records.length,
			pages: Math.ceil(records.length / params.pagination.limit),
			hasNext: false,
			hasPrev: false,
		},
	};
}
