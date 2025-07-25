import { isCarBodyTypeExist } from "@/data/cars-body-types/is-car-body-type-exist";
import type { DB } from "@/db";
import { z } from "zod";

export const IsCarBodyTypeExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export type IsCarBodyTypeExistParams = z.infer<typeof IsCarBodyTypeExistServiceSchema>;

export async function isCarBodyTypeExistService(db: DB, { name }: IsCarBodyTypeExistParams) {
	return await isCarBodyTypeExist(db, name);
}
