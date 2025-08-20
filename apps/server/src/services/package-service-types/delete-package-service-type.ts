import { z } from "zod";
import { packageServiceTypes } from "@/db/sqlite/schema";
import type { DB } from "@/db";
import { eq } from "drizzle-orm";

export const DeletePackageServiceTypeServiceSchema = z.object({
	id: z.string().min(1, "ID is required"),
});

export async function deletePackageServiceTypeService(
	db: DB,
	params: z.infer<typeof DeletePackageServiceTypeServiceSchema>,
) {
	const [deletedServiceType] = await db
		.delete(packageServiceTypes)
		.where(eq(packageServiceTypes.id, params.id))
		.returning();

	if (!deletedServiceType) {
		throw new Error("Service type not found");
	}

	return deletedServiceType;
}