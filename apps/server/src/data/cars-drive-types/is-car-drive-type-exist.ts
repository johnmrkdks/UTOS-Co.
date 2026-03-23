import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";

export async function isCarDriveTypeExist(
	db: DB,
	name: string,
): Promise<boolean> {
	const record = await db.query.carDriveTypes.findFirst({
		where: eq(carDriveTypes.name, name),
		columns: { id: true },
	});
	return !record;
}
