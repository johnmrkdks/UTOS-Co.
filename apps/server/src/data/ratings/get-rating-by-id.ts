import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { ratings } from "@/db/schema";

export async function getRatingById(db: DB, id: string) {
	const record = await db.query.ratings.findFirst({
		where: eq(ratings.id, id),
	});

	return record;
}
