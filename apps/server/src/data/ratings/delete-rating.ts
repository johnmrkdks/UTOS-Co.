import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { ratings } from "@/db/schema";

export async function deleteRating(db: DB, id: string) {
	const [deletedRating] = await db
		.delete(ratings)
		.where(eq(ratings.id, id))
		.returning();
	return deletedRating;
}
