import { z } from "zod";
import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import {
	paginationMetadataSchema,
	type PaginationMetadata,
} from "./pagination-metadata";

export const ResourceListSchema = z.object({
	limit: z.number().optional(),
	offset: z.number().optional(),
	sortBy: z.string().optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
	filters: z.record(z.string(), z.string()).optional(),
});

export type ResourceList = z.infer<typeof ResourceListSchema>;

export const QueryListResultSchema = (table: SQLiteTableWithColumns<any>) =>
	z.object({
		metadata: paginationMetadataSchema,
		data: z.array(createSelectSchema(table).partial()),
	});

export type QueryListResult<T> = {
	data: Partial<T>[];
	metadata: PaginationMetadata;
};