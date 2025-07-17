import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";
import type {
	CarTransmissionType,
	InsertCarTransmissionType,
} from "@/schemas/shared/tables/cars/car-transmission-type";

type CreateCarTransmissionType = InsertCarTransmissionType;

export async function createCarModel(
	db: DB,
	params: CreateCarTransmissionType,
): Promise<CarTransmissionType> {
	const [record] = await db
		.insert(carTransmissionTypes)
		.values(params)
		.returning();

	return record;
}
