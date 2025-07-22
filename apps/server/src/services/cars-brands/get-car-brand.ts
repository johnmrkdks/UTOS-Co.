import { getCarBrand } from "@/data/cars-brands/get-car-brand";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetCarBrandServiceSchema = z.object({
	id: z.string(),
});

export async function getCarBrandService(db: DB, { id }: z.infer<typeof GetCarBrandServiceSchema>) {
	const carBrand = await getCarBrand(db, id);

	if (!carBrand) {
		throw ErrorFactory.notFound("Car brand");
	}

	return carBrand;
}
