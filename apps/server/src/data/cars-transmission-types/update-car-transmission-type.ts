import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";
import type { UpdateCarTransmissionType } from "@/schemas/shared";

type UpdateCarTransmissionTypeParams = {
	id: string;
	data: UpdateCarTransmissionType;
};

export async function updateCarTransmissionType(
	db: DB,
	{ id, data }: UpdateCarTransmissionTypeParams,
) {
	const [updatedCarTransmissionType] = await db
		.update(carTransmissionTypes)
		.set(data)
		.where(eq(carTransmissionTypes.id, id))
		.returning();
	return updatedCarTransmissionType;
}
