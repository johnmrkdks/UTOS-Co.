import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carImages } from "@/db/schema";

export async function getCarImageById(db: DB, id: string) {
	const record = await db.query.carImages.findFirst({
		where: eq(carImages.id, id),
	});

	return record;
}
