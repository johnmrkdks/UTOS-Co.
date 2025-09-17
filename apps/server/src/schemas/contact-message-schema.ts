import { z } from "zod";

export const createContactMessageSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	email: z.string().email("Invalid email address").max(255, "Email is too long"),
	message: z.string().min(1, "Message is required").max(2000, "Message is too long"),
});

export const listContactMessagesSchema = z.object({
	status: z.enum(["unread", "read", "archived"]).optional(),
	limit: z.number().min(1).max(100).optional(),
	offset: z.number().min(0).optional(),
});

export const updateContactMessageStatusSchema = z.object({
	messageId: z.string().uuid("Invalid message ID"),
	status: z.enum(["unread", "read", "archived"]),
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
export type ListContactMessagesInput = z.infer<typeof listContactMessagesSchema>;
export type UpdateContactMessageStatusInput = z.infer<typeof updateContactMessageStatusSchema>;