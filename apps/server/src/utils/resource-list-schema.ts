import { z } from "zod";
import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import {
	paginationMetadataSchema,
	type PaginationMetadata,
} from "./pagination-metadata";

export const QueryListResultSchema = (table: SQLiteTableWithColumns<any>) =>
	z.object({
		metadata: paginationMetadataSchema,
		data: z.array(createSelectSchema(table).partial()),
	});

export type QueryListResult<T> = {
	data: Partial<T>[];
	metadata: PaginationMetadata;
};
