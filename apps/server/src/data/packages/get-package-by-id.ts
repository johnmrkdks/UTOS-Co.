import type { DB } from "@/db";
import { packages } from "@/db/schema";
import type { Package } from "@/schemas/shared/tables/package";
import { eq } from "drizzle-orm";

export async function getPackageById(
	db: DB,
	id: string,
): Promise<Package | null> {
	const record = await db.query.packages.findFirst({
		where: eq(packages.id, id),
	});

	if (!record) {
		throw new Error("Package not found");
	}

	return record;
}
