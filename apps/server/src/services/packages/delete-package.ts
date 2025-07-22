import { deletePackage } from "@/data/packages/delete-package";
import { getPackageById } from "@/data/packages/get-package-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function deletePackageService(db: DB, id: string) {
	const _package = await getPackageById(db, id);

	if (!_package) {
		throw ErrorFactory.notFound("Package not found.");
	}

	const deletedPackage = await deletePackage(db, id);
	return deletedPackage;
}
