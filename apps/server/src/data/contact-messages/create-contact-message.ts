import { contactMessages, type NewContactMessage } from "@/db/sqlite/schema";
import type { Database } from "@/types";

export async function createContactMessage(
	db: Database,
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