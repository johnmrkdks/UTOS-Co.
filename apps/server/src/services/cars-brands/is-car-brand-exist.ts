import { isCarBrandExist } from "@/data/cars-brands/is-car-brand-exist";
import type { DB } from "@/db";
import { z } from "zod";

export const IsCarBrandExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export async function isCarBrandExistService(db: DB, { name }: z.infer<typeof IsCarBrandExistServiceSchema>) {
	return await isCarBrandExist(db, name);
}
