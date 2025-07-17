import type { DB } from "@/db";
import { ratings } from "@/db/schema";
import type { Rating, UpdateRating } from "@/schemas/shared/tables/rating";
import { eq } from "drizzle-orm";

type UpdateRatingParams = {
	id: string;
	data: UpdateRating;
};

export async function updateRating(
	db: DB,
	params: UpdateRatingParams,
): Promise<Rating> {
	const { id, data } = params;

	const [record] = await db
		.update(ratings)
		.set(data)
		.where(eq(ratings.id, id))
		.returning();

	return record;
}
