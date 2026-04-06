import { and, eq, ne } from "drizzle-orm";
import { SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID } from "@/constants/system-hourly-template";
import type { DB } from "@/db";
import { packages } from "@/db/schema";
import type { Package } from "@/schemas/shared";
import { RQBFilterBuilder } from "@/utils/query/filter-builders";
import { filterPaginationSort } from "@/utils/query/filter-pagination-sort";
import type { QueryBuilder } from "@/utils/query/query-builder";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getPublishedPackages(db: DB, options: ResourceList) {
	const queryBuilder: QueryBuilder = {
		baseQuery: (opts?: any) =>
			db.query.packages.findMany({
				...opts,
				with: {
					packageServiceType: true,
					category: true,
				},
				where: opts?.where
					? and(
							eq(packages.isPublished, true),
							eq(packages.isAvailable, true),
							ne(packages.id, SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID),
							opts.where,
						)
					: and(
							eq(packages.isPublished, true),
							eq(packages.isAvailable, true),
							ne(packages.id, SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID),
						),
			}),
		filterBuilder: new RQBFilterBuilder(packages),
		queryType: "rqb",
	};

	return await filterPaginationSort<Package>(queryBuilder, options);
}
