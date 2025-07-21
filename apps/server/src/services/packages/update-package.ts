import { updatePackage } from "@/data/packages/update-package";
import type { DB } from "@/db";
import type { UpdatePackage } from "@/schemas/shared";
import formatter from "lodash";

type UpdatePackageParams = {
	id: string;
	data: UpdatePackage;
};

export async function updatePackageService(db: DB, { id, data }: UpdatePackageParams) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdatePackage;

	const updatedPackage = await updatePackage(db, { id, data: values });

	return updatedPackage;
}
