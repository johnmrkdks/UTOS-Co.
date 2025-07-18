import { getPackage } from "@/data/packages/get-package";
import type { DB } from "@/db";

export async function getPackageService(db: DB, id: string) {
	const packageItem = await getPackage(db, id);
	return packageItem;
}
