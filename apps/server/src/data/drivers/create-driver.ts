import type { DB } from "@/db";
import { drivers } from "@/db/sqlite/schema";
import type { InsertDriver } from "@/schemas/shared/tables/driver";

export type CreateDataFunc = (
	db: DB,
	data: InsertDriver,
) => Promise<(typeof drivers.$inferSelect)[]>;

export const createDriverData: CreateDataFunc = async (db, data) => {
	return await db.insert(drivers).values(data).returning();
};