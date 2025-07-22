import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Car } from "@/schemas/shared";

export async function getCarById(db: DB, id: string) {
	const record = await db.query.cars.findFirst({
		where: eq(cars.id, id),
		with: {
			features: true,
			images: true,
		},
	});

	return record;
}
