import { listContactMessages as listContactMessagesData } from "@/data/contact-messages";
import type { Database } from "@/types";
import type { ResourceList } from "@/types";

interface ListContactMessagesInput extends ResourceList {
	status?: "unread" | "read" | "archived";
}

export async function listContactMessages(
	db: Database,
	input: ListContactMessagesInput = {}
) {
	const { limit = 50, offset = 0, status } = input;

	const messages = await listContactMessagesData(db, {
		status,
		limit,
		offset,
	});

	return messages;
}