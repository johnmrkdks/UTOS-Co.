import formatter from "lodash";
import { z } from "zod";
import { getPackageById } from "@/data/packages/get-package-by-id";
import { updatePackage } from "@/data/packages/update-package";
import type { DB } from "@/db";
import { type UpdatePackage, UpdatePackageSchema } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const UpdatePackageServiceSchema = z.object({
	id: z.string(),
	data: UpdatePackageSchema,
});

export type UpdatePackageParams = z.infer<typeof UpdatePackageServiceSchema>;

export async function updatePackageService(
	db: DB,
	{ id, data }: UpdatePackageParams,
) {
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
