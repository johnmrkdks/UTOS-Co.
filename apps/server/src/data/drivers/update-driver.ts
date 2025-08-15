import type { DB } from "@/db";
import { drivers } from "@/db/sqlite/schema";
import type { UpdateDriver } from "@/schemas/shared/tables/driver";
import { eq } from "drizzle-orm";

export type UpdateDriverDataFunc = (
	db: DB,
	data: UpdateDriver & { id: string },
) => Promise<(typeof drivers.$inferSelect)[]>;

export const updateDriverData: UpdateDriverDataFunc = async (db, { id, ...data }) => {
	return await db.update(drivers).set(data).where(eq(drivers.id, id)).returning();
};