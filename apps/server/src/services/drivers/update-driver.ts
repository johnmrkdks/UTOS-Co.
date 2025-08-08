import type { DB } from "@/db";
import { drivers } from "@/db/schema";
import { type UpdateDriver, UpdateDriverSchema } from "@/schemas/shared";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const UpdateDriverServiceSchema = UpdateDriverSchema.extend({
	id: z.string(),
});

export type UpdateDriverParams = z.infer<typeof UpdateDriverServiceSchema>;

export async function updateDriverService(db: DB, data: UpdateDriverParams) {
	const { id, ...updateData } = data;
	
	const [updatedDriver] = await db
		.update(drivers)
		.set(updateData)
		.where(eq(drivers.id, id))
		.returning();

	return updatedDriver;
}