import { z } from "zod";

export const PaginationSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
});

export const SortSchema = z.object({
	field: z.string(),
	direction: z.enum(["asc", "desc"]).default("asc"),
});

export const BaseQuerySchema = z.object({
	pagination: PaginationSchema,
	sort: SortSchema.optional(),
	search: z.string().optional(),
	filters: z.record(z.any()).optional(),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;
export type SortParams = z.infer<typeof SortSchema>;
export type BaseQueryParams = z.infer<typeof BaseQuerySchema>;

export type QueryResult<T> = {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
};
