import { count, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export const getCarsCountByTransmissionTypeId = async (
	db: DB,
	transmissionTypeId: string,
) => {
	const [result] = await db
		.select({
			value: count(),
		})
		.from(cars)
		.where(eq(cars.transmissionTypeId, transmissionTypeId));

	return result.value;
};
