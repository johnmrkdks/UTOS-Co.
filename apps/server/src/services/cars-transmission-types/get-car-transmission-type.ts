import { getCarTransmissionTypeById } from "@/data/cars-transmission-types/get-car-transmission-type-by-id";
import type { DB } from "@/db";
import { z } from "zod";

export const GetCarTransmissionTypeServiceSchema = z.object({
	id: z.string(),
});

export type GetCarTransmissionTypeByIdParams = z.infer<typeof GetCarTransmissionTypeServiceSchema>;

export async function getCarTransmissionTypeService(db: DB, { id }: GetCarTransmissionTypeByIdParams) {
	const carTransmissionType = await getCarTransmissionTypeById(db, id);

	return carTransmissionType;
}
