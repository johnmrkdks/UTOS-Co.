import { getPackages } from "@/data/packages/get-packages";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getPackagesService(db: DB, options: ResourceList) {
	const packages = await getPackages(db, options);
	return packages;
}
