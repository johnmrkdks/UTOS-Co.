import type { DB } from "@/db";
import { drivers, users, cars } from "@/db/schema";
import { ResourceListParams } from "@/utils/query/resource-list";
import { eq, desc } from "drizzle-orm";

export async function getDriversService(db: DB, params: ResourceListParams) {
	const { limit = 10, offset = 0 } = params;

	const driversData = await db
		.select({
			id: drivers.id,
			userId: drivers.userId,
			licenseNumber: drivers.licenseNumber,
			carId: drivers.carId,
			isActive: drivers.isActive,
			isApproved: drivers.isApproved,
			createdAt: drivers.createdAt,
			updatedAt: drivers.updatedAt,
			user: {
				id: users.id,
				name: users.name,
				email: users.email,
				phone: users.phone,
			},
			car: {
				id: cars.id,
				name: cars.name,
				licensePlate: cars.licensePlate,
			},
		})
		.from(drivers)
		.leftJoin(users, eq(drivers.userId, users.id))
		.leftJoin(cars, eq(drivers.carId, cars.id))
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