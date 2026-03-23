import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { packageServiceTypes } from "@/db/sqlite/schema";

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
