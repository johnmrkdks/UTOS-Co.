import { getCarModelById } from "@/data/cars-models/get-car-model-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetCarModelServiceSchema = z.object({
	id: z.string(),
});

export type GetCarModelByIdParams = z.infer<typeof GetCarModelServiceSchema>;

export async function getCarModelService(db: DB, { id }: GetCarModelByIdParams) {
	const carModel = await getCarModelById(db, id);

	if (!carModel) {
		throw ErrorFactory.notFound("Car model not found.");
	}

	return carModel;
}
