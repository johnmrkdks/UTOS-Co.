import { z } from "zod";

const imageUrlsSchema = z
	.array(z.string().url("Each image must be a valid URL"))
	.min(1, "Add at least one image");

export const createBlogPostSchema = z.object({
	title: z.string().min(1, "Title is required"),
	excerpt: z.string().min(1, "Description is required"),
	imageUrls: imageUrlsSchema,
	slug: z.string().optional(),
	published: z.boolean().optional().default(true),
	sortOrder: z.number().int().optional().default(0),
});

export const updateBlogPostSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1).optional(),
	excerpt: z.string().min(1).optional(),
	imageUrls: imageUrlsSchema.optional(),
	slug: z.string().optional(),
	published: z.boolean().optional(),
	sortOrder: z.number().int().optional(),
});

export const deleteBlogPostSchema = z.object({
	id: z.string().min(1),
});
