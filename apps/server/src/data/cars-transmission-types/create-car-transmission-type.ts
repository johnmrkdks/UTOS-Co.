import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";
import type {
	CarTransmissionType,
	InsertCarTransmissionType,
} from "@/schemas/shared";

type CreateCarTransmissionTypeParams = InsertCarTransmissionType;

export async function createCarTransmissionType(
	db: DB,
	params: CreateCarTransmissionTypeParams,
): Promise<CarTransmissionType> {
	const [record] = await db
		.insert(carTransmissionTypes)
		.values(params)
		.returning();

	return record;
}
