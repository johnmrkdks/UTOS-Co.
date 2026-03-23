import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export async function checkCarCategoryUsage(db: DB, id: string) {
	const carsUsingCategory = await db.query.carCategories.findMany({
		where: eq(cars.driveTypeId, id),
	});

	const carCount = carsUsingCategory.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		totalUsages: carsUsingCategory.length,
		isInUse,
		cars: carsUsingCategory,
	};
}
