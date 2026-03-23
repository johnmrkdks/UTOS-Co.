import { z } from "zod";
import { isCarDriveTypeExist } from "@/data/cars-drive-types/is-car-drive-type-exist";
import type { DB } from "@/db";

export const IsCarDriveTypeExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export type IsCarDriveTypeExistParams = z.infer<
	typeof IsCarDriveTypeExistServiceSchema
>;

export async function isCarDriveTypeExistService(
	db: DB,
	{ name }: IsCarDriveTypeExistParams,
) {
	return await isCarDriveTypeExist(db, name);
}
