import { createPackage } from "@/data/packages/create-package";
import { getPackageByName } from "@/data/packages/get-package-by-name";
import type { DB } from "@/db";
import type { Package, InsertPackage } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

export async function createPackageService(db: DB, data: InsertPackage): Promise<Package> {
	const checkPackageExists = await getPackageByName(db, data.name);

	if (checkPackageExists) {
		throw ErrorFactory.duplicateEntry('Package', "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertPackage;

	const newPackage = createPackage(db, values);

	return newPackage;
}
