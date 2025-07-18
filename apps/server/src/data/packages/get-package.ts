import type { DB } from "@/db";
import { packages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getPackage(db: DB, id: string) {
	const [packageItem] = await db.select().from(packages).where(eq(packages.id, id));
	return packageItem;
}
