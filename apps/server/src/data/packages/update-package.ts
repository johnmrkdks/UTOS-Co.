import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdatePackage } from "@/schemas/shared";
import { packages } from "@/db/schema";

type UpdatePackageParams = {
	id: string;
	data: UpdatePackage;
};

export async function updatePackage(db: DB, { id, data }: UpdatePackageParams) {
	const [updatedPackage] = await db.update(packages).set(data).where(eq(packages.id, id)).returning();
	return updatedPackage;
}
