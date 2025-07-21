import type { DB } from "@/db";
import { ratings } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateRating } from "@/schemas/shared";

export async function updateRating(db: DB, id: string, data: UpdateRating) {
	const [updatedRating] = await db.update(ratings).set(data).where(eq(ratings.id, id)).returning();
	return updatedRating;
}
