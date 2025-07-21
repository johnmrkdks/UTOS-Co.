import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";
import type { CarFuelType } from "@/schemas/shared";
import { eq } from "drizzle-orm";

export async function getCarFuelTypeById(
	db: DB,
	id: string,
): Promise<CarFuelType | null> {
	const record = await db.query.carFuelTypes.findFirst({
		where: eq(carFuelTypes.id, id),
	});

	if (!record) {
		throw new Error("Car fuel type not found");
	}

	return record;
}
