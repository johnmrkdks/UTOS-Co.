import { z } from "zod";
import { InsertPackageServiceTypeSchema } from "@/schemas/shared/tables/package-service-type";
import { packageServiceTypes } from "@/db/sqlite/schema";
import { RateTypeEnum } from "@/db/sqlite/enums";
import type { DB } from "@/db";
import { sql } from "drizzle-orm";

export const CreatePackageServiceTypeServiceSchema = InsertPackageServiceTypeSchema;

export async function createPackageServiceTypeService(
	db: DB,
	data: z.infer<typeof CreatePackageServiceTypeServiceSchema>,
) {
	const [newServiceType] = await db
		.insert(packageServiceTypes)
		.values({
			...data,
			rateType: data.rateType as RateTypeEnum,
			updatedAt: new Date(),
		})
		.returning();

	return newServiceType;
}