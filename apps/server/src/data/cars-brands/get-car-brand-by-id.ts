import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import type { CarBrand } from "@/schemas/shared";
import { eq } from "drizzle-orm";

export async function getCarBrandById(
	db: DB,
	id: string,
): Promise<CarBrand | null> {
	const record = await db.query.carBrands.findFirst({
		where: eq(carBrands.id, id),
	});

	if (!record) {
		throw new Error("Car brands not found");
	}

	return record;
}
