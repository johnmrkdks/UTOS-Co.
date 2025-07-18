import type { Context } from "hono";
import { z } from "zod";

export const paginationMetadataSchema = z.object({
	page: z.number().int(),
	pageSize: z.number().int(),
	totalCount: z.number().int(),
	totalPages: z.number().int(),
});

export type PaginationMetadata = z.infer<typeof paginationMetadataSchema>;

type PaginationMetadataParams = {
	page: number;
	pageSize: number;
	totalCount: number;
};

export function paginationMetadata({
	page,
	pageSize,
	totalCount,
}: PaginationMetadataParams): PaginationMetadata {
	const totalPages = Math.ceil(totalCount / Number(pageSize));

	return {
		page,
		pageSize,
		totalCount,
		totalPages,
	};
}
