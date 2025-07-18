import type { DB } from "@/db";
import { ratings } from "@/db/schema";
import type { Rating, InsertRating } from "@/schemas/shared/tables/rating";
import { ratings } from "@/db/schema";

type CreateRatingParams = InsertRating;

export async function createRating(db: DB, params: CreateRatingParams): Promise<Rating> {
	const [record] = await db.insert(ratings).values(params).returning();

	return record;
}
