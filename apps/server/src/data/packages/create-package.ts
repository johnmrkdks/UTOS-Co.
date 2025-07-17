import type { DB } from "@/db";
import { packages } from "@/db/schema";
import type { InsertPackage, Package } from "@/schemas/shared/tables/package";

type CreatePackageParams = InsertPackage;

export async function createPackage(
	db: DB,
	params: CreatePackageParams,
): Promise<Package> {
	const [record] = await db.insert(packages).values(params).returning();

	return record;
}
