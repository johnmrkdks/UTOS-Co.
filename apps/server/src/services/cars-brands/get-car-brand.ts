import { z } from "zod";
import { getCarBrandById } from "@/data/cars-brands/get-car-brand-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const GetCarBrandServiceSchema = z.object({
	id: z.string(),
});

export type GetCarBrandByIdParams = z.infer<typeof GetCarBrandServiceSchema>;

export async function getCarBrandService(
	db: DB,
	{ id }: GetCarBrandByIdParams,
) {
	const carBrand = await getCarBrandById(db, id);

	if (!carBrand) {
		throw ErrorFactory.notFound("Car brand");
	}

	return carBrand;
}
