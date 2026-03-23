import { desc, eq } from "drizzle-orm";
import type { DB } from "@/db";
import type { ContactMessage } from "@/db/sqlite/schema";
import { contactMessages } from "@/db/sqlite/schema";
import type { ResourceList } from "@/utils/query/resource-list";

interface ListContactMessagesOptions extends ResourceList {
	status?: "unread" | "read" | "archived";
}

export async function listContactMessages(
	db: DB,
	options: ListContactMessagesOptions = {},
) {
	const { status, limit = 50, offset = 0 } = options;

	// Build the where condition based on status filter
	const whereCondition = status
		? eq(contactMessages.status, status)
		: undefined;

	// Execute the query with filtering
	const data = await db
		.select()
		.from(contactMessages)
		.where(whereCondition)
		.orderBy(desc(contactMessages.createdAt))
		.limit(limit)
		.offset(offset);

	// Get total count for pagination
	const totalCount = await db
		.select({ count: contactMessages.id })
		.from(contactMessages)
		.where(whereCondition);

	return {
		data,
		metadata: {
			total: totalCount.length,
			limit,
			offset,
			page: Math.floor(offset / limit) + 1,
			totalPages: Math.ceil(totalCount.length / limit),
		},
	};
}
