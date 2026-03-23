import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { packages } from "@/db/schema";

export async function deletePackage(db: DB, id: string) {
	const [deletedPackage] = await db
		.delete(packages)
		.where(eq(packages.id, id))
		.returning();
	return deletedPackage;
}
