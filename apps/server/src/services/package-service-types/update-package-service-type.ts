import { z } from "zod";
import { UpdatePackageServiceTypeSchema } from "@/schemas/shared/tables/package-service-type";
import { packageServiceTypes } from "@/db/sqlite/schema";
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
			updatedAt: new Date(),
		})
		.where(eq(packageServiceTypes.id, id))
		.returning();

	if (!updatedServiceType) {
		throw new Error("Service type not found");
	}

	return updatedServiceType;
}