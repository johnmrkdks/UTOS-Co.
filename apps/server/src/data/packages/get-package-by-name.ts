import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { packages } from "@/db/schema";

export async function getPackageByName(db: DB, name: string) {
	const record = await db.query.packages.findFirst({
		where: eq(packages.name, name),
	});

	return record;
}
