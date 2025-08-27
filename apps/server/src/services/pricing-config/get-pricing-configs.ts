import type { DB } from "@/db";
import { pricingConfig } from "@/db/schema";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getPricingConfigsService(db: DB, options: ResourceList) {
	try {
		// Use query builder with relations like cars service
		const configs = await db.query.pricingConfig.findMany({
			with: {
				car: {
					with: {
						model: {
							with: {
								brand: true
							}
						}
					}
				}
			},
		});
		
		// Apply basic pagination
		const limit = options.limit || 10;
		const offset = options.offset || 0;
		
		const paginatedConfigs = configs.slice(offset, offset + limit);
		
		return {
			data: paginatedConfigs,
			pagination: {
				total: configs.length,
				totalPages: Math.ceil(configs.length / limit),
				currentPage: Math.floor(offset / limit) + 1,
				limit,
				offset,
			}
		};
	} catch (error) {
		console.error("Error in getPricingConfigsService:", error);
		throw new Error(`Failed to fetch pricing configurations: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}