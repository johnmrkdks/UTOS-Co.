import { getCarBodyTypeById } from "@/data/cars-body-types/get-car-body-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetCarBodyTypeServiceSchema = z.object({
	id: z.string(),
});

export async function getCarBodyTypeService(
	db: DB,
	{ id }: z.infer<typeof GetCarBodyTypeServiceSchema>,
) {
	const carBodyType = await getCarBodyTypeById(db, id);

	if (!carBodyType) {
		throw ErrorFactory.notFound("Car body type not found.");
	}

	return carBodyType;
}
