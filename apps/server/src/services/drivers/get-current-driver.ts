import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { drivers } from "@/db/schema";

export const GetCurrentDriverServiceSchema = z.object({
	userId: z.string(),
});

export type GetCurrentDriverServiceInput = z.infer<
	typeof GetCurrentDriverServiceSchema
>;

export async function getCurrentDriverService(
	db: DB,
	input: GetCurrentDriverServiceInput,
) {
	const driver = await db
		.select()
		.from(drivers)
		.where(eq(drivers.userId, input.userId))
		.limit(1);

	return driver[0] || null;
}
