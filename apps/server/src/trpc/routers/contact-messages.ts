import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/trpc/init";
import { createContactMessage, listContactMessages, updateContactMessageStatus } from "@/services/contact-messages";
import { createContactMessageSchema, listContactMessagesSchema, updateContactMessageStatusSchema } from "@/schemas/contact-message-schema";

export const contactMessagesRouter = router({
	create: publicProcedure
		.input(createContactMessageSchema)
		.mutation(async ({ ctx, input }) => {
			return await createContactMessage(ctx.db, input);
		}),

	list: protectedProcedure
		.input(listContactMessagesSchema)
		.query(async ({ ctx, input }) => {
			// Only admins can view contact messages
			if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
				throw new Error("Unauthorized: Admin access required");
			}

			return await listContactMessages(ctx.db, input);
		}),

	updateStatus: protectedProcedure
		.input(updateContactMessageStatusSchema)
		.mutation(async ({ ctx, input }) => {
			// Only admins can update message status
			if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
				throw new Error("Unauthorized: Admin access required");
			}

			return await updateContactMessageStatus(ctx.db, input.messageId, input.status);
		}),
});