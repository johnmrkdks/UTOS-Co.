import type { DB } from "@/db";
import { packages } from "@/db/schema";
import type { Package, UpdatePackage } from "@/schemas/shared/tables/package";
import { eq } from "drizzle-orm";

type UpdatePackageParams = {
	id: string;
	data: Partial<UpdatePackage>;
};

export async function updatePackage(
	db: DB,
	params: UpdatePackageParams,
): Promise<Package> {
	const { id, data } = params;

	const [record] = await db
		.update(packages)
		.set(data)
		.where(eq(packages.id, id))
		.returning();

	return record;
}
