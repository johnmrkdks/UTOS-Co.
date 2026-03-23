import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carModels } from "@/db/schema";

export const getCarModelById = async (db: DB, id: string) => {
	const carModel = await db.query.carModels.findFirst({
		where: eq(carModels.id, id),
	});

	return carModel;
};
