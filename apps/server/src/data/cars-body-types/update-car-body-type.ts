import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import type { UpdateCarBodyType } from "@/schemas/shared";

type UpdateCarBodyTypeParams = {
	id: string;
	data: UpdateCarBodyType;
};

export async function updateCarBodyType(
	db: DB,
	{ id, data }: UpdateCarBodyTypeParams,
) {
	const [updatedCarBodyType] = await db
		.update(carBodyTypes)
		.set(data)
		.where(eq(carBodyTypes.id, id))
		.returning();
	return updatedCarBodyType;
}
