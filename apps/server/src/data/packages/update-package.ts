import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdatePackage } from "@/schemas/shared";
import { packages } from "@/db/schema";

export async function updatePackage(db: DB, id: string, data: UpdatePackage) {
	const [updatedPackage] = await db.update(packages).set(data).where(eq(packages.id, id)).returning();
	return updatedPackage;
}
