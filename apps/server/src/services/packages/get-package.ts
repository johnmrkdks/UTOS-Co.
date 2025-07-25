import { getPackageById } from "@/data/packages/get-package-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetPackageServiceSchema = z.object({
	id: z.string(),
});

export type GetPackageByIdParams = z.infer<typeof GetPackageServiceSchema>;

export async function getPackageService(db: DB, { id }: GetPackageByIdParams) {
	const packageItem = await getPackageById(db, id);

	if (!packageItem) {
		throw ErrorFactory.notFound("Package not found.");
	}

	return packageItem;
}
