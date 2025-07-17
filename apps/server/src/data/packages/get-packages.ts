import type { DB } from "@/db";
import { packages } from "@/db/schema";
import type { Package } from "@/schemas/shared/tables/package";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetPackagesParams = AdvancedQuerySchema;

export async function getPackages(
	db: DB,
	params: GetPackagesParams,
): Promise<QueryListResult<Package>> {
	const records = await advancedQuery(db, packages, params);

	return records;
}
