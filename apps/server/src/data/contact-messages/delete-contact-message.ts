import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { contactMessages } from "@/db/sqlite/schema";

export async function deleteContactMessage(db: DB, messageId: string) {
	const [deletedMessage] = await db
		.delete(contactMessages)
		.where(eq(contactMessages.id, messageId))
		.returning();

	return deletedMessage;
}
