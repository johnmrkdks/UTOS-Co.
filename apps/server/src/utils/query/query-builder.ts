import { type AnyColumn, type SQL } from "drizzle-orm";

export interface FilterBuilder<T = any> {
	build(filters: Record<string, string>): SQL<unknown>[];
}

export type QueryType = "sql" | "rqb"; // sql = SQL-like, rqb = Relational Query Builder

export interface QueryBuilder<T = any> {
	baseQuery: any; // Base query (can include joins, with clauses, etc.)
	countQuery?: any; // Optional separate count query for complex joins
	filterBuilder?: FilterBuilder<T>;
	sortColumns?: Record<string, AnyColumn>; // Map of sortable column names to actual columns
	queryType?: QueryType;
}
