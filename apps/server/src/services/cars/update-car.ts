import { getCarById } from "@/data/cars/get-car-by-id";
import { updateCar } from "@/data/cars/update-car";
import type { DB } from "@/db";
import { UpdateCarSchema, type UpdateCar } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const UpdateCarServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarSchema,
});

export async function updateCarService(db: DB, { id, data }: z.infer<typeof UpdateCarServiceSchema>) {
	const car = await getCarById(db, id);

	if (!car) {
		throw ErrorFactory.notFound("Car not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
		modelId: data.modelId ? data.modelId : undefined,
	} as UpdateCar;

	const updatedCar = await updateCar(db, { id, data: values });

	return updatedCar;
}
