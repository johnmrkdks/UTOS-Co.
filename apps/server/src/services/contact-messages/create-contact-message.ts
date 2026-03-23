import { createContactMessage as createContactMessageData } from "@/data/contact-messages";
import type { DB } from "@/db";

interface CreateContactMessageInput {
	name: string;
	email: string;
	message: string;
}

export async function createContactMessage(
	db: DB,
	input: CreateContactMessageInput,
) {
	const contactMessage = await createContactMessageData(db, {
		name: input.name.trim(),
		email: input.email.trim().toLowerCase(),
		message: input.message.trim(),
	});

	return contactMessage;
}
