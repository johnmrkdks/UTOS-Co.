import { isCarBrandExist } from "@/data/cars-brands/is-car-brand-exist";
import type { DB } from "@/db";
import { z } from "zod";

export const IsCarBrandExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export type IsCarBrandExistParams = z.infer<typeof IsCarBrandExistServiceSchema>;

export async function isCarBrandExistService(db: DB, { name }: IsCarBrandExistParams) {
	return await isCarBrandExist(db, name);
}
