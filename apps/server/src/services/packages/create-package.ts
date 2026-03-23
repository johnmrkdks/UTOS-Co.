import formatter from "lodash";
import type { z } from "zod";
import { createPackage } from "@/data/packages/create-package";
import { getPackageByName } from "@/data/packages/get-package-by-name";
import type { DB } from "@/db";
import {
	type InsertPackage,
	InsertPackageSchema,
	type Package,
} from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const CreatePackageServiceSchema = InsertPackageSchema;

export type CreatePackageParams = z.infer<typeof CreatePackageServiceSchema>;

export async function createPackageService(db: DB, data: CreatePackageParams) {
	console.log(
		"🚀 createPackageService - Input data:",
		JSON.stringify(data, null, 2),
	);

	const packageName = await getPackageByName(db, data.name);
	console.log(
		"📦 Existing package with name check:",
		packageName ? "EXISTS" : "NOT_FOUND",
	);

	if (packageName) {
		console.log("❌ Package name already exists:", data.name);
		throw ErrorFactory.duplicateEntry("Package", "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
		description: data.description.trim(),
	} as InsertPackage;

	console.log("💾 Values to insert:", JSON.stringify(values, null, 2));

	try {
		const newPackage = await createPackage(db, values);
		console.log(
			"✅ Package created successfully:",
			JSON.stringify(newPackage, null, 2),
		);
		return newPackage;
	} catch (error) {
		console.error("❌ Database insertion failed:", error);
		throw error;
	}
}
