import { getPublishedPackages } from "@/data/packages/get-published-packages";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getPublishedPackagesService(db: DB, params: ResourceList) {
	const packages = await getPublishedPackages(db, params);
	return packages;
}