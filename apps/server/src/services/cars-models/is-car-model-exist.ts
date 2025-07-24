import { isCarModelExist } from "@/data/cars-models/is-car-model-exist";
import type { DB } from "@/db";
import { z } from "zod";

export const IsCarModelExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export async function isCarModelExistService(db: DB, { name }: z.infer<typeof IsCarModelExistServiceSchema>) {
	return await isCarModelExist(db, name);
}
