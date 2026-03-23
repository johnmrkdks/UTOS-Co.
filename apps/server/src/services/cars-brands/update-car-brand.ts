import formatter from "lodash";
import { z } from "zod";
import { getCarBrandById } from "@/data/cars-brands/get-car-brand-by-id";
import { updateCarBrand } from "@/data/cars-brands/update-car-brand";
import type { DB } from "@/db";
import { type UpdateCarBrand, UpdateCarBrandSchema } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const UpdateCarBrandServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarBrandSchema,
});

export type UpdateCarBrandParams = z.infer<typeof UpdateCarBrandServiceSchema>;

export async function updateCarBrandService(
	db: DB,
	{ id, data }: UpdateCarBrandParams,
) {
	const carBrand = await getCarBrandById(db, id);

	if (!carBrand) {
		throw ErrorFactory.notFound("Car brand not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarBrand;

	const updatedCarBrand = await updateCarBrand(db, { id, data: values });

	return updatedCarBrand;
}
