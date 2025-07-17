import type { DB } from "@/db";
import { bookings, ratings } from "@/db/schema";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import type { InsertRating, Rating } from "@/schemas/shared/tables/rating";

type CreateRatingParams = InsertRating;

export async function createRating(
	db: DB,
	params: CreateRatingParams,
): Promise<Rating> {
	const [record] = await db.insert(ratings).values(params).returning();

	return record;
}
