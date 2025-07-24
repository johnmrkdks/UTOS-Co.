import type { DB } from "@/db";
import { ratings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRatingById(
	db: DB,
	id: string,
) {
	const record = await db.query.ratings.findFirst({
		where: eq(ratings.id, id),
	});

	return record;
}
