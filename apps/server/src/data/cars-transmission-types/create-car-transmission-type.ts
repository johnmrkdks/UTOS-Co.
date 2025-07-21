import type { DB } from "@/db";
import type { CarTransmissionType, InsertCarTransmissionType } from "@/schemas/shared";
import { carTransmissionTypes } from "@/db/schema";

type CreateCarTransmissionTypeParams = InsertCarTransmissionType;

export async function createCarTransmissionType(db: DB, params: CreateCarTransmissionTypeParams): Promise<CarTransmissionType> {
	const [record] = await db.insert(carTransmissionTypes).values(params).returning();

	return record;
}
