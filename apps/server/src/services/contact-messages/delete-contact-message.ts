import { deleteContactMessage as deleteContactMessageData } from "@/data/contact-messages";
import type { DB } from "@/db";

export async function deleteContactMessage(
	db: DB,
	messageId: string
) {
	const deletedMessage = await deleteContactMessageData(db, messageId);

	if (!deletedMessage) {
		throw new Error("Contact message not found");
	}

	return deletedMessage;
}