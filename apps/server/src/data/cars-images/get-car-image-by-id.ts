import type { DB } from "@/db";
import { carImages } from "@/db/schema";
import type { CarImage } from "@/schemas/shared";
import { eq } from "drizzle-orm";

export async function getCarImageById(
	db: DB,
	id: string,
) {
	const record = await db.query.carImages.findFirst({
		where: eq(carImages.id, id),
	});

	return record;
}
