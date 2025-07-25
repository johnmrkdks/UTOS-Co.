import { isCarTransmissionTypeExist } from "@/data/cars-transmission-types/is-car-transmission-type-exist";
import type { DB } from "@/db";
import { z } from "zod";

export const IsCarTransmissionTypeExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export type IsCarTransmissionTypeExistParams = z.infer<typeof IsCarTransmissionTypeExistServiceSchema>;

export async function isCarTransmissionTypeExistService(db: DB, { name }: IsCarTransmissionTypeExistParams) {
	return await isCarTransmissionTypeExist(db, name);
}
