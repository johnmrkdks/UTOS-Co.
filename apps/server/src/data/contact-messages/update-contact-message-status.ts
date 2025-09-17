import { contactMessages } from "@/db/sqlite/schema";
import { eq } from "drizzle-orm";
import type { Database } from "@/types";

export async function updateContactMessageStatus(
	db: Database,
	messageId: string,
	status: "unread" | "read" | "archived"
) {
	const [updatedMessage] = await db
		.update(contactMessages)
		.set({
			status,
			updatedAt: new Date()
		})
		.where(eq(contactMessages.id, messageId))
		.returning();

	return updatedMessage;
}