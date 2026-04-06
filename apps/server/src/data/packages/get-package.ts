import { eq } from "drizzle-orm";
import { z } from "zod";
import {
	getSyntheticHourlyTemplatePackageRow,
	SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID,
} from "@/constants/system-hourly-template";
import type { DB } from "@/db";
import { packages } from "@/db/schema";

export const GetPackageSchema = z.object({
	id: z.string(),
});

export type GetPackageParams = z.infer<typeof GetPackageSchema>;

export async function getPackage(db: DB, params: GetPackageParams) {
	if (params.id === SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID) {
		const row = await db.query.packages.findFirst({
			where: eq(packages.id, params.id),
		});
		return row ?? getSyntheticHourlyTemplatePackageRow();
	}

	const record = await db.query.packages.findFirst({
		where: eq(packages.id, params.id),
	});

	return record;
}
