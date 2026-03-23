import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";

export async function getCarDriveTypeByName(db: DB, name: string) {
	const record = await db.query.carDriveTypes.findFirst({
		where: eq(carDriveTypes.name, name),
	});

	return record;
}
