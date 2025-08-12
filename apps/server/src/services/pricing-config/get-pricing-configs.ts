import type { DB } from "@/db";
import { pricingConfig } from "@/db/schema";
import type { ResourceList } from "@/utils/query/resource-list";
import { eq, desc } from "drizzle-orm";

export async function getPricingConfigsService(db: DB, params: ResourceList) {
	const { limit = 10, offset = 0 } = params;

	const configs = await db
		.select()
		.from(pricingConfig)
		.orderBy(desc(pricingConfig.createdAt))
		.limit(limit)
		.offset(offset);

	const totalQuery = await db
		.select({ count: pricingConfig.id })
		.from(pricingConfig);

	return {
		items: configs,
		totalItems: totalQuery.length,
		limit,
		offset,
	};
}