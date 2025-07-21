import type { DB } from "@/db";
import { ratings } from "@/db/schema";
import type { Rating } from "@/schemas/shared";
import { eq } from "drizzle-orm";

export async function getRatingById(
	db: DB,
	id: string,
): Promise<Rating | null> {
	const record = await db.query.ratings.findFirst({
		where: eq(ratings.id, id),
	});

	if (!record) {
		throw new Error("Rating not found");
	}

	return record;
}
