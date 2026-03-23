import { z } from "zod";
import { isCarBrandExist } from "@/data/cars-brands/is-car-brand-exist";
import type { DB } from "@/db";

export const IsCarBrandExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export type IsCarBrandExistParams = z.infer<
	typeof IsCarBrandExistServiceSchema
>;

export async function isCarBrandExistService(
	db: DB,
	{ name }: IsCarBrandExistParams,
) {
	return await isCarBrandExist(db, name);
}
