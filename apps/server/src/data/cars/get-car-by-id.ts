import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export async function getCarById(db: DB, id: string) {
	const record = await db.query.cars.findFirst({
		where: eq(cars.id, id),
		with: {
			carsToFeatures: {
				with: {
					feature: true,
				},
			},
			images: true,
			model: {
				with: {
					brand: true,
				},
			},
			bodyType: true,
			conditionType: true,
			driveType: true,
			fuelType: true,
			transmissionType: true,
			category: true,
		},
	});

	if (!record) {
		return undefined;
	}

	const { carsToFeatures, ...rest } = record;
	const features = carsToFeatures.map((ctf) => ctf.feature);

	return { ...rest, features };
}
