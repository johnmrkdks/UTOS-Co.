import { z } from "zod";
import { packageServiceTypes } from "@/db/sqlite/schema";
import type { DB } from "@/db";
import { eq } from "drizzle-orm";

export const GetPackageServiceTypeServiceSchema = z.object({
	id: z.string().min(1, "ID is required"),
});

export async function getPackageServiceTypeService(
	db: DB,
	params: z.infer<typeof GetPackageServiceTypeServiceSchema>,
) {
	const [serviceType] = await db
		.select()
		.from(packageServiceTypes)
		.where(eq(packageServiceTypes.id, params.id));

	if (!serviceType) {
		throw new Error("Service type not found");
	}

	return serviceType;
}