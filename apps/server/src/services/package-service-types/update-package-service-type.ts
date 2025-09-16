import { z } from "zod";
import { UpdatePackageServiceTypeSchema } from "@/schemas/shared/tables/package-service-type";
import { packageServiceTypes } from "@/db/sqlite/schema";
import { RateTypeEnum } from "@/db/sqlite/enums";
import type { DB } from "@/db";
import { eq } from "drizzle-orm";

export const UpdatePackageServiceTypeServiceSchema = UpdatePackageServiceTypeSchema;

export async function updatePackageServiceTypeService(
	db: DB,
	data: z.infer<typeof UpdatePackageServiceTypeServiceSchema>,
) {
	const { id, ...updateData } = data;

	const [updatedServiceType] = await db
		.update(packageServiceTypes)
		.set({
			...updateData,
			...(updateData.rateType && { rateType: updateData.rateType as RateTypeEnum }),
			updatedAt: new Date(),
		} as any)
		.where(eq(packageServiceTypes.id, id))
		.returning();

	if (!updatedServiceType) {
		throw new Error("Service type not found");
	}

	return updatedServiceType;
}