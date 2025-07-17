import type { DB } from "@/db";
import { packages } from "@/db/schema";
import type { Package } from "@/schemas/shared/tables/package";
import { eq } from "drizzle-orm";

export async function deletePackage(db: DB, id: string): Promise<Package> {
	const [record] = await db
		.delete(packages)
		.where(eq(packages.id, id))
		.returning();

	return record;
}
