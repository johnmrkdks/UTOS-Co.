import { isCarFuelTypeExist } from "@/data/cars-fuel-types/is-car-fuel-type-exist";
import type { DB } from "@/db";
import { z } from "zod";

export const IsCarFuelTypeExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export async function isCarFuelTypeExistService(db: DB, { name }: z.infer<typeof IsCarFuelTypeExistServiceSchema>) {
	return await isCarFuelTypeExist(db, name);
}
