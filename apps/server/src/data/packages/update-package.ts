import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { packages } from "@/db/schema";
import type { UpdatePackage } from "@/schemas/shared";

type UpdatePackageParams = {
	id: string;
	data: UpdatePackage;
};

export async function updatePackage(db: DB, { id, data }: UpdatePackageParams) {
	const [updatedPackage] = await db
		.update(packages)
		.set(data)
		.where(eq(packages.id, id))
		.returning();
	return updatedPackage;
}
