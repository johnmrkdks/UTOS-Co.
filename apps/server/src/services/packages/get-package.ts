import { getPackageById } from "@/data/packages/get-package-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function getPackageService(db: DB, id: string) {
	const packageItem = await getPackageById(db, id);

	if (!packageItem) {
		throw ErrorFactory.notFound("Package not found.");
	}

	return packageItem;
}
