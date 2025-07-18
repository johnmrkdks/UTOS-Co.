import { updateCarFuelType } from "@/data/cars-fuel-types/update-car-fuel-type";
import type { DB } from "@/db";
import type { UpdateCarFuelType } from "@/schemas/shared/tables/car-fuel-type";
import formatter from "lodash";

export async function updateCarFuelTypeService(db: DB, id: string, data: UpdateCarFuelType) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarFuelType;

	const updatedCarFuelType = await updateCarFuelType(db, id, values);

	return updatedCarFuelType;
}
