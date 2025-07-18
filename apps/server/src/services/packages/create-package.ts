import { createPackage } from "@/data/packages/create-package";
import type { DB } from "@/db";
import type { Package, InsertPackage } from "@/schemas/shared/tables/package";
import formatter from "lodash";

export async function createPackageService(db: DB, data: InsertPackage): Promise<Package> {
	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertPackage;

	const newPackage = createPackage(db, values);

	return newPackage;
}
