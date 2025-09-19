import type { DB } from "@/db";
import { packages } from "@/db/schema";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { ResourceList } from "@/utils/query/resource-list";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { Package } from "@/schemas/shared";
import { eq, and } from "drizzle-orm";

export async function getPublishedPackages(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: (opts?: any) => db.query.packages.findMany({
			...opts,
			with: {
				packageServiceType: true,
				category: true,
			},
			where: opts?.where ? and(
				eq(packages.isPublished, true),
				eq(packages.isAvailable, true),
				opts.where
			) : and(
				eq(packages.isPublished, true),
				eq(packages.isAvailable, true)
			)
		}),
		filterBuilder: new RQBFilterBuilder(packages),
		queryType: "rqb",
	};

	return await filterPaginationSort<Package>(queryBuilder, options);
}