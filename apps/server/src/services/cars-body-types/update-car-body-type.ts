import { getCarBodyType } from "@/data/cars-body-types/get-car-body-type";
import { updateCarBodyType } from "@/data/cars-body-types/update-car-body-type";
import type { DB } from "@/db";
import type { UpdateCarBodyType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

type UpdateCarBodyTypeParams = {
	id: string;
	data: UpdateCarBodyType;
};

export async function updateCarBodyTypeService(db: DB, { id, data }: UpdateCarBodyTypeParams) {
	const carBodyType = await getCarBodyType(db, id);

	if (!carBodyType) {
		throw ErrorFactory.notFound("Car body type not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarBodyType;

	const updatedCarBodyType = await updateCarBodyType(db, { id, data: values });

	return updatedCarBodyType;
}
