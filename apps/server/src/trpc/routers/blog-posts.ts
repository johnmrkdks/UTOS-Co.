import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { users } from "@/db/sqlite/schema/users";
import {
	createBlogPostSchema,
	deleteBlogPostSchema,
	updateBlogPostSchema,
} from "@/schemas/blog-post-schema";
import {
	createBlogPost,
	deleteBlogPost,
	listAllBlogPostsAdmin,
	listPublishedBlogPosts,
	updateBlogPost,
} from "@/services/blog-posts";
import type { Context } from "@/trpc/context";
import { protectedProcedure, publicProcedure, router } from "@/trpc/init";

const getUserRole = async (db: Context["db"], userId: string) => {
	const user = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	return user[0]?.role;
};

const requireAdmin = async (ctx: Context) => {
	const userId = ctx.session?.user?.id || ctx.session?.session?.userId;
	if (!userId) {
		throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in required" });
	}
	const role = await getUserRole(ctx.db, userId);
	if (!role || !["admin", "super_admin"].includes(role)) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}
};

export const blogPostsRouter = router({
	listPublished: publicProcedure.query(async ({ ctx }) => {
		return await listPublishedBlogPosts(ctx.db);
	}),

	adminList: protectedProcedure.query(async (opts) => {
		await requireAdmin(opts.ctx);
		return await listAllBlogPostsAdmin(opts.ctx.db);
	}),

	create: protectedProcedure
		.input(createBlogPostSchema)
		.mutation(async (opts) => {
			await requireAdmin(opts.ctx);
			return await createBlogPost(opts.ctx.db, opts.input);
		}),

	update: protectedProcedure
		.input(updateBlogPostSchema)
		.mutation(async (opts) => {
			await requireAdmin(opts.ctx);
			return await updateBlogPost(opts.ctx.db, opts.input);
		}),

	delete: protectedProcedure
		.input(deleteBlogPostSchema)
		.mutation(async (opts) => {
			await requireAdmin(opts.ctx);
			await deleteBlogPost(opts.ctx.db, opts.input.id);
		}),
});
