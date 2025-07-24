import { isCarTransmissionTypeExist } from "@/data/cars-transmission-types/is-car-transmission-type-exist";
import type { DB } from "@/db";
import { z } from "zod";

export const IsCarTransmittionTypeExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export async function isCarTransmissionTypeExistService(db: DB, { name }: z.infer<typeof IsCarTransmittionTypeExistServiceSchema>) {
	return await isCarTransmissionTypeExist(db, name);
}
