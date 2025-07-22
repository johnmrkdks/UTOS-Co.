import { getCarTransmissionTypeById } from "@/data/cars-transmission-types/get-car-transmission-type-by-id";
import { updateCarTransmissionType } from "@/data/cars-transmission-types/update-car-transmission-type";
import type { DB } from "@/db";
import type { UpdateCarTransmissionType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

type UpdateCarTransmissionTypeParams = {
	id: string;
	data: UpdateCarTransmissionType;
};

export async function updateCarTransmissionTypeService(db: DB, { id, data }: UpdateCarTransmissionTypeParams) {
	const carTransmissionType = await getCarTransmissionTypeById(db, id);

	if (!carTransmissionType) {
		throw ErrorFactory.notFound("Car transmission type not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarTransmissionType;

	const updatedCarTransmissionType = await updateCarTransmissionType(db, { id, data: values });

	return updatedCarTransmissionType;
}
