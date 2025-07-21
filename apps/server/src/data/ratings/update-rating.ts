import type { DB } from "@/db";
import { ratings } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateRating } from "@/schemas/shared";

type UpdateRatingParams = {
	id: string;
	data: UpdateRating;
};

export async function updateRating(db: DB, { id, data }: UpdateRatingParams) {
	const [updatedRating] = await db.update(ratings).set(data).where(eq(ratings.id, id)).returning();
	return updatedRating;
}
