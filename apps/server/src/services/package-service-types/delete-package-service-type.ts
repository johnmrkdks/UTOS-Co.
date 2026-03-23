import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { packageServiceTypes } from "@/db/sqlite/schema";

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
