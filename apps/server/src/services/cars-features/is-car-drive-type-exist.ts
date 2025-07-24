import { isCarFeatureExist } from "@/data/cars-features/is-car-feature-exist";
import type { DB } from "@/db";
import { z } from "zod";

export const IsCarFeatureExistServiceSchema = z.object({
	feature: z.string().min(1).max(50),
});

export async function isCarFeatureExistService(db: DB, { feature }: z.infer<typeof IsCarFeatureExistServiceSchema>) {
	return await isCarFeatureExist(db, feature);
}
