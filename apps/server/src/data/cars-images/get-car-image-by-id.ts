import type { DB } from "@/db";
import { carImages } from "@/db/schema";
import type { CarImage } from "@/schemas/shared/tables/cars/car-image";
import { eq } from "drizzle-orm";

export async function getCarImageById(
	db: DB,
	id: string,
): Promise<CarImage | null> {
	const record = await db.query.carImages.findFirst({
		where: eq(carImages.id, id),
	});

	if (!record) {
		throw new Error("Car image not found");
	}

	return record;
}
