import type { DB } from "@/db";
import { ratings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRating(db: DB, id: string) {
	const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
	return rating;
}
