import { getPackages } from "@/data/packages/get-packages";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getPackagesService(db: DB, params: ResourceList) {
	const packages = await getPackages(db, params);
	return packages;
}
