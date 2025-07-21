import type { DB } from "@/db";
import type { Package, InsertPackage } from "@/schemas/shared";
import { packages } from "@/db/schema";

type CreatePackageParams = InsertPackage;

export async function createPackage(db: DB, params: CreatePackageParams): Promise<Package> {
	const [record] = await db.insert(packages).values(params).returning();

	return record;
}
