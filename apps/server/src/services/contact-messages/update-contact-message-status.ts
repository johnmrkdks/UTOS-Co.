import { updateContactMessageStatus as updateContactMessageStatusData } from "@/data/contact-messages";
import type { Database } from "@/types";

export async function updateContactMessageStatus(
	db: Database,
	messageId: string,
	status: "unread" | "read" | "archived"
) {
	const updatedMessage = await updateContactMessageStatusData(db, messageId, status);

	if (!updatedMessage) {
		throw new Error("Contact message not found");
	}

	return updatedMessage;
}