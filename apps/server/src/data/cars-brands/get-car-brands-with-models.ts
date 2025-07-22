import type { DB } from "@/db";
import type { CarBrandWithModels } from "@/schemas/shared";
import { paginationMetadata } from "@/utils/pagination-metadata";
import type { QueryListResult, ResourceList } from "@/utils/resource-list-schema";

export async function getCarBrandsWithModels(db: DB, options: ResourceList): Promise<QueryListResult<CarBrandWithModels>> {
	const brands = await db.query.carBrands.findMany({
		with: { models: true }
	});

	// Apply filtering manually
	let filteredBrands = brands;
	if (options.filters) {
		filteredBrands = brands.filter(brand => {
			for (const [key, value] of Object.entries(options.filters!)) {
				if (key === 'name' && !brand.name.toLowerCase().includes(value.toLowerCase())) {
					return false;
				}
				// Add more filter logic as needed
			}
			return true;
		});
	}

	// Apply sorting
	if (options.sortBy) {
		filteredBrands.sort((a, b) => {
			const aVal = a[options.sortBy as keyof typeof a];
			const bVal = b[options.sortBy as keyof typeof b];
			const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return options.sortOrder === 'desc' ? -comparison : comparison;
		});
	}

	// Apply pagination
	const totalCount = filteredBrands.length;
	const { limit = 10, offset = 0 } = options;
	const data = filteredBrands.slice(offset, offset + limit);

	const metadata = paginationMetadata({
		totalCount,
		pageSize: limit,
		page: Math.floor(offset / limit) + 1,
	});

	return { data, metadata };
}
