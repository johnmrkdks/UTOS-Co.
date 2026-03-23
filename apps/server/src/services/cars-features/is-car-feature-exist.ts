import { z } from "zod";
import { isCarFeatureExist } from "@/data/cars-features/is-car-feature-exist";
import type { DB } from "@/db";

export const IsCarFeatureExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export type IsCarFeatureExistParams = z.infer<
	typeof IsCarFeatureExistServiceSchema
>;

export async function isCarFeatureExistService(
	db: DB,
	{ name }: IsCarFeatureExistParams,
) {
	return await isCarFeatureExist(db, name);
}
