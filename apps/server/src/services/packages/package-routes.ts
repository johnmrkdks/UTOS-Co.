import { eq, asc } from "drizzle-orm";
import type { DB } from "@/db";
import { packageRoutes } from "@/db/sqlite/schema/packages/package-routes";

export async function getPackageRoutesByPackageId(db: DB, packageId: string) {
	return await db
		.select()
		.from(packageRoutes)
		.where(eq(packageRoutes.packageId, packageId))
		.orderBy(asc(packageRoutes.stopOrder));
}

export async function createPackageRoute(
	db: DB,
	data: {
		packageId: string;
		stopOrder: number;
		locationName: string;
		address: string;
		latitude?: number;
		longitude?: number;
		estimatedDuration?: number;
		isPickupPoint?: boolean;
		isDropoffPoint?: boolean;
	},
) {
	const [route] = await db
		.insert(packageRoutes)
		.values({
			packageId: data.packageId,
			stopOrder: data.stopOrder,
			locationName: data.locationName,
			address: data.address,
			latitude: data.latitude,
			longitude: data.longitude,
			estimatedDuration: data.estimatedDuration,
			isPickupPoint: data.isPickupPoint ?? false,
			isDropoffPoint: data.isDropoffPoint ?? false,
		})
		.returning();
	
	return route;
}

export async function updatePackageRoute(
	db: DB,
	id: string,
	data: {
		stopOrder: number;
		locationName: string;
		address: string;
		latitude?: number;
		longitude?: number;
		estimatedDuration?: number;
		isPickupPoint?: boolean;
		isDropoffPoint?: boolean;
	},
) {
	const [route] = await db
		.update(packageRoutes)
		.set({
			stopOrder: data.stopOrder,
			locationName: data.locationName,
			address: data.address,
			latitude: data.latitude,
			longitude: data.longitude,
			estimatedDuration: data.estimatedDuration,
			isPickupPoint: data.isPickupPoint ?? false,
			isDropoffPoint: data.isDropoffPoint ?? false,
		})
		.where(eq(packageRoutes.id, id))
		.returning();
	
	return route;
}

export async function deletePackageRoute(db: DB, id: string) {
	const [deletedRoute] = await db
		.delete(packageRoutes)
		.where(eq(packageRoutes.id, id))
		.returning();
	
	return deletedRoute;
}

export async function reorderPackageRoutes(
	db: DB,
	packageId: string,
	routeOrders: { id: string; stopOrder: number }[],
) {
	// Update all routes in a transaction-like manner
	const updatedRoutes = [];
	
	for (const { id, stopOrder } of routeOrders) {
		const [route] = await db
			.update(packageRoutes)
			.set({ stopOrder })
			.where(eq(packageRoutes.id, id))
			.returning();
		
		if (route) {
			updatedRoutes.push(route);
		}
	}
	
	return updatedRoutes;
}