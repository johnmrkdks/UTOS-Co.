import { getCarTransmissionTypeById } from "@/data/cars-transmission-types/get-car-transmission-type-by-id";
import type { DB } from "@/db";
import { z } from "zod";

export const GetCarTransmissionTypeServiceSchema = z.object({
	id: z.string(),
});

export async function getCarTransmissionTypeService(db: DB, { id }: z.infer<typeof GetCarTransmissionTypeServiceSchema>) {
	const carTransmissionType = await getCarTransmissionTypeById(db, id);

	return carTransmissionType;
}
