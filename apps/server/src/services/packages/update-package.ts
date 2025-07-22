import { getPackageById } from "@/data/packages/get-package-by-id";
import { updatePackage } from "@/data/packages/update-package";
import type { DB } from "@/db";
import { UpdatePackageSchema, type UpdatePackage } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const UpdatePackageServiceSchema = z.object({
	id: z.string(),
	data: UpdatePackageSchema,
});

export async function updatePackageService(db: DB, { id, data }: z.infer<typeof UpdatePackageServiceSchema>) {
	const _package = await getPackageById(db, id);

	if (!_package) {
		throw ErrorFactory.notFound("Package not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdatePackage;

	const updatedPackage = await updatePackage(db, { id, data: values });

	return updatedPackage;
}
