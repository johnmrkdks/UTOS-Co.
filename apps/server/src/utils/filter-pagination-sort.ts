import type { DB } from "@/db";
import { asc, desc, like } from "drizzle-orm";
import { paginationMetadata } from "./pagination-metadata";
import type { QueryListResult, ResourceList } from "./resource-list-schema";

export async function filterPaginationSort<T extends Record<string, any>>(
	db: DB,
	table: any,
	options: ResourceList,
): Promise<QueryListResult<T>> {
	const {
		limit = 10,
		offset = 0,
		sortBy,
		sortOrder = "asc",
		filters,
	} = options;

	let query = db.select().from(table).$dynamic();

	if (filters) {
		for (const key in filters) {
			if (Object.prototype.hasOwnProperty.call(filters, key)) {
				const value = filters[key];
				query = query.where(like(table[key], `%${value}%`));
			}
		}
	}

	const totalCount = (await query.execute()).length;

	if (sortBy) {
		const order =
			sortOrder === "desc" ? desc(table[sortBy]) : asc(table[sortBy]);
		query = query.orderBy(order);
	}

	query = query.limit(limit).offset(offset);

	const data = await query.execute();

	const metadata = paginationMetadata({
		totalCount,
		pageSize: limit,
		page: Math.floor(offset / limit) + 1,
	});

	return { data, metadata };
}
