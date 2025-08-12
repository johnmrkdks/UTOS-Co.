import type { DB } from "@/db";
import { drivers, users } from "@/db/schema";
import type { ResourceList } from "@/utils/query/resource-list";
import { eq, desc } from "drizzle-orm";

export async function getDriversService(db: DB, params: ResourceList) {
	const { limit = 10, offset = 0 } = params;

	const driversData = await db
		.select({
			id: drivers.id,
			userId: drivers.userId,
			licenseNumber: drivers.licenseNumber,
			licenseExpiry: drivers.licenseExpiry,
			isActive: drivers.isActive,
			isApproved: drivers.isApproved,
			isAvailable: drivers.isAvailable,
			rating: drivers.rating,
			totalRides: drivers.totalRides,
			createdAt: drivers.createdAt,
			updatedAt: drivers.updatedAt,
			user: {
				id: users.id,
				name: users.name,
				email: users.email,
			},
		})
		.from(drivers)
		.leftJoin(users, eq(drivers.userId, users.id))
		.orderBy(desc(drivers.createdAt))
		.limit(limit)
		.offset(offset);

	const totalQuery = await db
		.select({ count: drivers.id })
		.from(drivers);

	return {
		items: driversData,
		totalItems: totalQuery.length,
		limit,
		offset,
	};
}