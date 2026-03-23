import { z } from "zod";
import { isCarCategoryExist } from "@/data/cars-categories/is-car-category-exist";
import type { DB } from "@/db";

export const IsCarCategoryExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export type IsCarCategoryExistParams = z.infer<
	typeof IsCarCategoryExistServiceSchema
>;

export async function isCarCategoryExistService(
	db: DB,
	{ name }: IsCarCategoryExistParams,
) {
	return await isCarCategoryExist(db, name);
}
