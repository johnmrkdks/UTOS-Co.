import { asc } from "drizzle-orm";
import type { DB } from "@/db";
import { packageServiceTypes } from "@/db/sqlite/schema";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getPackageServiceTypesService(
	db: DB,
	params: ResourceList,
) {
	const serviceTypes = await db
		.select()
		.from(packageServiceTypes)
		.orderBy(
			asc(packageServiceTypes.displayOrder),
			asc(packageServiceTypes.name),
		);

	return {
		data: serviceTypes,
		totalCount: serviceTypes.length,
		currentPage: 1,
		totalPages: 1,
	};
}
