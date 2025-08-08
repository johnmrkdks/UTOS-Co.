import { eq, asc } from "drizzle-orm";
import type { DrizzleDB } from "@/db";
import { packageCategories } from "@/db/sqlite/schema/packages/package-categories";

export async function getAllPackageCategories(db: DrizzleDB) {
	return await db
		.select()
		.from(packageCategories)
		.orderBy(asc(packageCategories.displayOrder), asc(packageCategories.name));
}

export async function getPackageCategoryById(db: DrizzleDB, id: string) {
	const result = await db
		.select()
		.from(packageCategories)
		.where(eq(packageCategories.id, id))
		.limit(1);
	
	return result[0] || null;
}

export async function createPackageCategory(
	db: DrizzleDB,
	data: {
		name: string;
		description?: string;
		displayOrder?: number;
	},
) {
	const [category] = await db
		.insert(packageCategories)
		.values({
			name: data.name,
			description: data.description,
			displayOrder: data.displayOrder ?? 0,
		})
		.returning();
	
	return category;
}

export async function updatePackageCategory(
	db: DrizzleDB,
	id: string,
	data: {
		name: string;
		description?: string;
		displayOrder?: number;
	},
) {
	const [category] = await db
		.update(packageCategories)
		.set({
			name: data.name,
			description: data.description,
			displayOrder: data.displayOrder ?? 0,
		})
		.where(eq(packageCategories.id, id))
		.returning();
	
	return category;
}

export async function deletePackageCategory(db: DrizzleDB, id: string) {
	const [deletedCategory] = await db
		.delete(packageCategories)
		.where(eq(packageCategories.id, id))
		.returning();
	
	return deletedCategory;
}