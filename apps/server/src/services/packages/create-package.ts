import { createPackage } from "@/data/packages/create-package";
import { getPackageByName } from "@/data/packages/get-package-by-name";
import type { DB } from "@/db";
import { type Package, type InsertPackage, InsertPackageSchema } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const CreatePackageServiceSchema = InsertPackageSchema

export async function createPackageService(db: DB, data: z.infer<typeof CreatePackageServiceSchema>) {
	const packageName = await getPackageByName(db, data.name);

	if (packageName) {
		throw ErrorFactory.duplicateEntry('Package', "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertPackage;

	const newPackage = createPackage(db, values);

	return newPackage;
}
