import { deletePackage } from "@/data/packages/delete-package";
import type { DB } from "@/db";

export async function deletePackageService(db: DB, id: string) {
	const deletedPackage = await deletePackage(db, id);
	return deletedPackage;
}
