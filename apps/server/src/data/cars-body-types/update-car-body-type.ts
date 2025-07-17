import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import type {
	CarBodyType,
	UpdateCarBodyType,
} from "@/schemas/shared/tables/cars/car-body-type";
import { eq } from "drizzle-orm";

type UpdateCarBodyTypeParams = {
	id: string;
	data: Partial<UpdateCarBodyType>;
};

export async function updateCarBodyType(
	db: DB,
	params: UpdateCarBodyTypeParams,
): Promise<CarBodyType> {
	const { id, data } = params;

	const [record] = await db
		.update(carBodyTypes)
		.set(data)
		.where(eq(carBodyTypes.id, id))
		.returning();

	return record;
}
