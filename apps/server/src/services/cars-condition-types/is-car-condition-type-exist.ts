import { isCarConditionTypeExist } from "@/data/cars-condition-types/is-car-condition-type-exist";
import type { DB } from "@/db";
import { z } from "zod";

export const IsCarConditionTypeExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export async function isCarConditionTypeExistService(db: DB, { name }: z.infer<typeof IsCarConditionTypeExistServiceSchema>) {
	return await isCarConditionTypeExist(db, name);
}
