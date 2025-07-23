import { doesCarModelExist } from "@/data/cars-models/does-car-model-exist";
import type { DB } from "@/db";
import { z } from "zod";

export const DoesCarModelExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export async function doesCarModelExistService(db: DB, { name }: z.infer<typeof DoesCarModelExistServiceSchema>) {
	return await doesCarModelExist(db, name);
}
