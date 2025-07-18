import { updatePackage } from "@/data/packages/update-package";
import type { DB } from "@/db";
import type { UpdatePackage } from "@/schemas/shared/tables/package";
import formatter from "lodash";

export async function updatePackageService(db: DB, id: string, data: UpdatePackage) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdatePackage;

	const updatedPackage = await updatePackage(db, id, values);

	return updatedPackage;
}
