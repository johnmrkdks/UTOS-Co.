import { asc, desc, and } from "drizzle-orm";
import { paginationMetadata } from "./pagination-metadata";
import type { QueryListResult, ResourceList } from "./resource-list";
import type { QueryBuilder } from "./query-builder";

export async function filterPaginationSort<T extends Record<string, any>>(
	queryBuilder: QueryBuilder<T>,
	options: ResourceList,
): Promise<QueryListResult<T>> {
	const isRQB = queryBuilder.queryType === "rqb";

	if (isRQB) {
		// Handle Relational Query Builder (RQB) queries
		return handleRQBQuery(queryBuilder, options);
	} else {
		// Handle SQL-like queries (default)
		return handleSQLQuery(queryBuilder, options);
	}
}

async function handleSQLQuery<T extends Record<string, any>>(
	queryBuilder: QueryBuilder<T>,
	options: ResourceList,
): Promise<QueryListResult<T>> {
	const {
		limit = 10,
		offset = 0,
		sortBy,
		sortOrder = "asc",
		filters,
	} = options;

	// Start with the base query (which can include joins, with clauses, etc.)
	let query = queryBuilder.baseQuery.$dynamic();
	let countQuery = queryBuilder.countQuery || queryBuilder.baseQuery;

	// Apply filters if provided
	if (filters && queryBuilder.filterBuilder) {
		const filterConditions = queryBuilder.filterBuilder.build(filters);
		if (filterConditions.length > 0) {
			const combinedConditions = and(...filterConditions);
			query = query.where(combinedConditions);

			// Only apply where to countQuery if it's different from baseQuery
			if (queryBuilder.countQuery) {
				countQuery = countQuery.where(combinedConditions);
			}
		}
	}

	// Get total count (using separate count query if provided)
	const totalCount = (await countQuery.execute()).length;

	// Apply sorting
	if (sortBy && queryBuilder.sortColumns && queryBuilder.sortColumns[sortBy]) {
		const sortColumn = queryBuilder.sortColumns[sortBy];
		const order = sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);
		query = query.orderBy(order);
	}

	// Apply pagination
	query = query.limit(limit).offset(offset);

	// Execute the final query
	const data = await query.execute();

	const metadata = paginationMetadata({
		totalCount,
		pageSize: limit,
		page: Math.floor(offset / limit) + 1,
	});

	return { data, metadata };
}

async function handleRQBQuery<T extends Record<string, any>>(
	queryBuilder: QueryBuilder<T>,
	options: ResourceList,
): Promise<QueryListResult<T>> {
	const {
		limit = 10,
		offset = 0,
		sortBy,
		sortOrder = "asc",
		filters,
	} = options;

	// Build the query options for RQB
	const queryOptions: any = {
		limit,
		offset,
	};

	// Apply filters if provided
	if (filters && queryBuilder.filterBuilder) {
		const whereFunction = queryBuilder.filterBuilder.build(filters);
		if (whereFunction) {
			queryOptions.where = whereFunction;
		}
	}

	// Apply sorting
	if (sortBy && queryBuilder.sortColumns && queryBuilder.sortColumns[sortBy]) {
		const sortColumn = queryBuilder.sortColumns[sortBy];
		queryOptions.orderBy = sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);
	}

	// Get total count (execute query without pagination first)
	const countOptions = { ...queryOptions };
	delete countOptions.limit;
	delete countOptions.offset;

	// Execute count query
	const totalItems = await queryBuilder.baseQuery(countOptions);
	const totalCount = totalItems.length;

	// Execute the paginated query
	const data = await queryBuilder.baseQuery(queryOptions);

	const metadata = paginationMetadata({
		totalCount,
		pageSize: limit,
		page: Math.floor(offset / limit) + 1,
	});

	return { data, metadata };
}
