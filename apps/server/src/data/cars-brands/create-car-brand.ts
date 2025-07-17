import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import type {
	CarBrand,
	InsertCarBrand,
} from "@/schemas/shared/tables/cars/car-brand";

type CreateCarBrandParams = InsertCarBrand;

export async function createCarBrands(
	db: DB,
	params: CreateCarBrandParams,
): Promise<CarBrand> {
	const [record] = await db.insert(carBrands).values(params).returning();

	return record;
}
