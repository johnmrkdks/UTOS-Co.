import { z } from "zod";
import { getCarBodyTypeById } from "@/data/cars-body-types/get-car-body-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const GetCarBodyTypeServiceSchema = z.object({
	id: z.string(),
});

export type GetCarBodyTypeByIdParams = z.infer<
	typeof GetCarBodyTypeServiceSchema
>;

export async function getCarBodyTypeService(
	db: DB,
	{ id }: GetCarBodyTypeByIdParams,
) {
	const carBodyType = await getCarBodyTypeById(db, id);

	if (!carBodyType) {
		throw ErrorFactory.notFound("Car body type not found.");
	}

	return carBodyType;
}
