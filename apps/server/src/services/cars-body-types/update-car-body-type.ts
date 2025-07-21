import { updateCarBodyType } from "@/data/cars-body-types/update-car-body-type";
import type { DB } from "@/db";
import type { UpdateCarBodyType } from "@/schemas/shared";
import formatter from "lodash";

type UpdateCarBodyTypeParams = {
	id: string;
	data: UpdateCarBodyType;
};

export async function updateCarBodyTypeService(db: DB, { id, data }: UpdateCarBodyTypeParams) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarBodyType;

	const updatedCarBodyType = await updateCarBodyType(db, { id, data: values });

	return updatedCarBodyType;
}
