import { contactMessages, type NewContactMessage } from "@/db/sqlite/schema";
import type { DB } from "@/db";

export async function createContactMessage(
	db: DB,
	data: Omit<NewContactMessage, "id" | "createdAt" | "updatedAt" | "status">
) {
	const [contactMessage] = await db
		.insert(contactMessages)
		.values({
			...data,
			status: "unread",
		})
		.returning();

	return contactMessage;
}