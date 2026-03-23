import { listContactMessages as listContactMessagesData } from "@/data/contact-messages";
import type { DB } from "@/db";
import type { ResourceList } from "@/types";

interface ListContactMessagesInput extends ResourceList {
	status?: "unread" | "read" | "archived";
}

export async function listContactMessages(
	db: DB,
	input: ListContactMessagesInput = {},
) {
	return await listContactMessagesData(db, input);
}
