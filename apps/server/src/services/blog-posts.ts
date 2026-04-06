import { desc, eq } from "drizzle-orm";
import type { z } from "zod";
import type { DB } from "@/db";
import { blogPosts } from "@/db/sqlite/schema/blog-posts";
import type {
	createBlogPostSchema,
	updateBlogPostSchema,
} from "@/schemas/blog-post-schema";

export type BlogPostRecord = typeof blogPosts.$inferSelect;

export type BlogPostPublic = BlogPostRecord & {
	/** Parsed from `image_urls` JSON; first item is cover / list thumbnail */
	imageUrls: string[];
};

function parseImageUrlsJson(
	imageUrlsJson: string | null | undefined,
	fallbackImageUrl: string,
): string[] {
	if (imageUrlsJson) {
		try {
			const arr = JSON.parse(imageUrlsJson) as unknown;
			if (Array.isArray(arr)) {
				const urls = arr.filter(
					(u): u is string => typeof u === "string" && u.trim().length > 0,
				);
				if (urls.length > 0) return urls;
			}
		} catch {
			// ignore invalid JSON
		}
	}
	return fallbackImageUrl ? [fallbackImageUrl] : [];
}

function mapPost(row: BlogPostRecord): BlogPostPublic {
	const imageUrls = parseImageUrlsJson(row.imageUrls, row.imageUrl);
	return {
		...row,
		imageUrls,
		imageUrl: imageUrls[0] ?? row.imageUrl,
	};
}

function slugify(input: string): string {
	const s = input
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 120);
	return s || "post";
}

type CreateInput = z.infer<typeof createBlogPostSchema>;
type UpdateInput = z.infer<typeof updateBlogPostSchema>;

export async function listPublishedBlogPosts(
	db: DB,
): Promise<BlogPostPublic[]> {
	const rows = await db
		.select()
		.from(blogPosts)
		.where(eq(blogPosts.published, true))
		.orderBy(desc(blogPosts.sortOrder), desc(blogPosts.createdAt));
	return rows.map(mapPost);
}

export async function listAllBlogPostsAdmin(db: DB): Promise<BlogPostPublic[]> {
	const rows = await db
		.select()
		.from(blogPosts)
		.orderBy(desc(blogPosts.sortOrder), desc(blogPosts.createdAt));
	return rows.map(mapPost);
}

export async function createBlogPost(db: DB, input: CreateInput) {
	const baseSlug = slugify(input.slug?.trim() || input.title);
	const existing = await db
		.select({ id: blogPosts.id })
		.from(blogPosts)
		.where(eq(blogPosts.slug, baseSlug))
		.limit(1);
	let slug = baseSlug;
	if (existing.length > 0) {
		slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
	}

	const imageUrlsJson = JSON.stringify(input.imageUrls);
	const [row] = await db
		.insert(blogPosts)
		.values({
			title: input.title,
			slug,
			excerpt: input.excerpt,
			imageUrl: input.imageUrls[0],
			imageUrls: imageUrlsJson,
			published: input.published ?? true,
			sortOrder: input.sortOrder ?? 0,
		})
		.returning();
	return mapPost(row);
}

export async function updateBlogPost(db: DB, input: UpdateInput) {
	const { id, ...rest } = input;
	const updates: Partial<typeof blogPosts.$inferInsert> = {
		updatedAt: new Date(),
	};
	if (rest.title !== undefined) updates.title = rest.title;
	if (rest.excerpt !== undefined) updates.excerpt = rest.excerpt;
	if (rest.imageUrls !== undefined) {
		updates.imageUrls = JSON.stringify(rest.imageUrls);
		updates.imageUrl = rest.imageUrls[0];
	}
	if (rest.published !== undefined) updates.published = rest.published;
	if (rest.sortOrder !== undefined) updates.sortOrder = rest.sortOrder;
	if (rest.slug !== undefined && rest.slug.trim() !== "") {
		updates.slug = slugify(rest.slug);
	}
	const [row] = await db
		.update(blogPosts)
		.set(updates)
		.where(eq(blogPosts.id, id))
		.returning();
	return row ? mapPost(row) : undefined;
}

export async function deleteBlogPost(db: DB, id: string) {
	await db.delete(blogPosts).where(eq(blogPosts.id, id));
}
