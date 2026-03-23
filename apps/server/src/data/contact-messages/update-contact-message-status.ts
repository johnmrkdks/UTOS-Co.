import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { contactMessages } from "@/db/sqlite/schema";

export async function updateContactMessageStatus(
	db: DB,
	messageId: string,
	status: "unread" | "read" | "archived",
) {
	const [updatedMessage] = await db
		.update(contactMessages)
		.set({
			status,
			updatedAt: new Date(),
		})
		.where(eq(contactMessages.id, messageId))
		.returning();

	return updatedMessage;
}
