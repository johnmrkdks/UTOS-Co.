import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "@/db/sqlite/schema/users";
import {
	createContactMessageSchema,
	deleteContactMessageSchema,
	listContactMessagesSchema,
	updateContactMessageStatusSchema,
} from "@/schemas/contact-message-schema";
import {
	createContactMessage,
	deleteContactMessage,
	listContactMessages,
	updateContactMessageStatus,
} from "@/services/contact-messages";
import { protectedProcedure, publicProcedure, router } from "@/trpc/init";

// Helper function to get user role from database
const getUserRole = async (db: any, userId: string) => {
	const user = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	return user[0]?.role;
};

export const contactMessagesRouter = router({
	create: publicProcedure
		.input(createContactMessageSchema)
		.mutation(async ({ ctx, input }) => {
			return await createContactMessage(ctx.db, input);
		}),

	list: protectedProcedure
		.input(listContactMessagesSchema)
		.query(async ({ ctx, input }) => {
			// Get user info from session
			const userId = ctx.session?.user?.id || ctx.session?.session?.userId;

			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User must be authenticated to view contact messages",
				});
			}

			// Get user role from database
			const userRole = await getUserRole(ctx.db, userId);

			// Only admins can view contact messages
			if (!userRole || !["admin", "super_admin"].includes(userRole)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Admin access required to view contact messages",
				});
			}

			return await listContactMessages(ctx.db, input);
		}),

	updateStatus: protectedProcedure
		.input(updateContactMessageStatusSchema)
		.mutation(async ({ ctx, input }) => {
			// Get user info from session
			const userId = ctx.session?.user?.id || ctx.session?.session?.userId;

			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User must be authenticated to update message status",
				});
			}

			// Get user role from database
			const userRole = await getUserRole(ctx.db, userId);

			// Only admins can update message status
			if (!userRole || !["admin", "super_admin"].includes(userRole)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Admin access required to update message status",
				});
			}

			return await updateContactMessageStatus(
				ctx.db,
				input.messageId,
				input.status,
			);
		}),

	delete: protectedProcedure
		.input(deleteContactMessageSchema)
		.mutation(async ({ ctx, input }) => {
			// Get user info from session
			const userId = ctx.session?.user?.id || ctx.session?.session?.userId;

			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User must be authenticated to delete messages",
				});
			}

			// Get user role from database
			const userRole = await getUserRole(ctx.db, userId);

			// Only admins can delete messages
			if (!userRole || !["admin", "super_admin"].includes(userRole)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Admin access required to delete messages",
				});
			}

			return await deleteContactMessage(ctx.db, input.messageId);
		}),
});
