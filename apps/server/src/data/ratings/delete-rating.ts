import type { DB } from "@/db";
import { ratings } from "@/db/schema";
import type { Rating } from "@/schemas/shared/tables/rating";
import { eq } from "drizzle-orm";

export async function deleteRating(db: DB, id: string): Promise<Rating> {
	const [record] = await db
		.delete(ratings)
		.where(eq(ratings.id, id))
		.returning();

	return record;
}
