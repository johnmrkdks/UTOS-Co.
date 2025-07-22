import { doesCarBrandExist } from "@/data/cars-brands/does-car-brand-exist";
import { getCarBrand } from "@/data/cars-brands/get-car-brand";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DoesCarBrandExistSchema = z.object({
	name: z.string().min(1).max(50),
});

export async function doesCarBrandExistService(db: DB, { name }: z.infer<typeof DoesCarBrandExistSchema>) {
	return await doesCarBrandExist(db, name);
}
