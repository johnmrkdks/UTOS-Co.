import type { DB } from "@/db";
import { packages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const GetPackageSchema = z.object({
	id: z.string(),
});

export type GetPackageParams = z.infer<typeof GetPackageSchema>;

export async function getPackage(db: DB, params: GetPackageParams) {
	const record = await db.query.packages.findFirst({
		where: eq(packages.id, params.id),
	});

	return record;
}