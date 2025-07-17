import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import type { CarDriveType } from "@/schemas/shared/tables/cars/car-drive-type";
import type { CarFeature } from "@/schemas/shared/tables/cars/car-feature";
import { eq } from "drizzle-orm";

export async function getCarFeatureById(
	db: DB,
	id: string,
): Promise<CarFeature | null> {
	const record = await db.query.carFeatures.findFirst({
		where: eq(carFeatures.id, id),
	});

	if (!record) {
		throw new Error("Car feature not found");
	}

	return record;
}
