import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { packages } from "@/db/schema";

export const TogglePublishPackageServiceSchema = z.object({
	id: z.string(),
	isPublished: z.boolean(),
});

export type TogglePublishPackageService = z.infer<
	typeof TogglePublishPackageServiceSchema
>;

export async function togglePublishPackageService(
	db: DB,
	{ id, isPublished }: TogglePublishPackageService,
) {
	const [updatedPackage] = await db
		.update(packages)
		.set({
			isPublished,
			updatedAt: new Date(),
		})
		.where(eq(packages.id, id))
		.returning();

	if (!updatedPackage) {
		throw new Error("Package not found");
	}

	return updatedPackage;
}
