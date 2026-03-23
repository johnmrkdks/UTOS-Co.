import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { packages } from "@/db/schema";

export async function getPackageById(db: DB, id: string) {
	const record = await db.query.packages.findFirst({
		where: eq(packages.id, id),
	});

	return record;
}
