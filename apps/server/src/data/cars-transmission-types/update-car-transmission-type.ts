import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";
import type {
	CarTransmissionType,
	UpdateCarTransmissionType,
} from "@/schemas/shared/tables/cars/car-transmission-type";
import { eq } from "drizzle-orm";

type UpdateCarTransmissionTypeParams = {
	id: string;
	data: Partial<UpdateCarTransmissionType>;
};

export async function updateCarTransmissionType(
	db: DB,
	params: UpdateCarTransmissionTypeParams,
): Promise<CarTransmissionType> {
	const { id, data } = params;

	const [record] = await db
		.update(carTransmissionTypes)
		.set(data)
		.where(eq(carTransmissionTypes.id, id))
		.returning();

	return record;
}
