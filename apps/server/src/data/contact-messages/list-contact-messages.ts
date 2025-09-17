import { contactMessages } from "@/db/sqlite/schema";
import { desc, eq } from "drizzle-orm";
import type { Database } from "@/types";

export async function listContactMessages(
	db: Database,
	options?: {
		status?: "unread" | "read" | "archived";
		limit?: number;
		offset?: number;
	}
) {
	let query = db.select().from(contactMessages);

	if (options?.status) {
		query = query.where(eq(contactMessages.status, options.status));
	}

	query = query.orderBy(desc(contactMessages.createdAt));

	if (options?.limit) {
		query = query.limit(options.limit);
	}

	if (options?.offset) {
		query = query.offset(options.offset);
	}

	return await query;
}