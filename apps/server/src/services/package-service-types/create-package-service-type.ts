import { sql } from "drizzle-orm";
import type { z } from "zod";
import type { DB } from "@/db";
import type { RateTypeEnum } from "@/db/sqlite/enums";
import { packageServiceTypes } from "@/db/sqlite/schema";
import { InsertPackageServiceTypeSchema } from "@/schemas/shared/tables/package-service-type";

export const CreatePackageServiceTypeServiceSchema =
	InsertPackageServiceTypeSchema;

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
