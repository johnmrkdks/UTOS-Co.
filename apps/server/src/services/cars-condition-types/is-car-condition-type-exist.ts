import { z } from "zod";
import { isCarConditionTypeExist } from "@/data/cars-condition-types/is-car-condition-type-exist";
import type { DB } from "@/db";

export const IsCarConditionTypeExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export type IsCarConditionTypeExistParams = z.infer<
	typeof IsCarConditionTypeExistServiceSchema
>;

export async function isCarConditionTypeExistService(
	db: DB,
	{ name }: IsCarConditionTypeExistParams,
) {
	return await isCarConditionTypeExist(db, name);
}
