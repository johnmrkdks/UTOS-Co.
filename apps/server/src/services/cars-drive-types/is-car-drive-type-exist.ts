import { isCarDriveTypeExist } from "@/data/cars-drive-types/is-car-drive-type-exist";
import type { DB } from "@/db";
import { z } from "zod";

export const IsCarDriveTypeExistServiceSchema = z.object({
	name: z.string().min(1).max(50),
});

export async function isCarDriveTypeExistService(db: DB, { name }: z.infer<typeof IsCarDriveTypeExistServiceSchema>) {
	return await isCarDriveTypeExist(db, name);
}
