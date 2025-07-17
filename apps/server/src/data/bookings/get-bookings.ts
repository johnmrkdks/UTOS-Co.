import type { DB } from "@/db";
import { bookings } from "@/db/schema";
import type { Booking } from "@/schemas/shared/tables/booking";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetBookingsParams = AdvancedQuerySchema;

export async function getBookings(
	db: DB,
	params: GetBookingsParams,
): Promise<QueryListResult<Booking>> {
	const records = await advancedQuery(db, bookings, params);

	return records;
}
