import { updateCarFuelType } from "@/data/cars-fuel-types/update-car-fuel-type";
import type { DB } from "@/db";
import type { UpdateCarFuelType } from "@/schemas/shared";
import formatter from "lodash";

type UpdateCarFuelTypeParams = {
	id: string;
	data: UpdateCarFuelType;
};

export async function updateCarFuelTypeService(db: DB, { id, data }: UpdateCarFuelTypeParams) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarFuelType;

	const updatedCarFuelType = await updateCarFuelType(db, { id, data: values });

	return updatedCarFuelType;
}
