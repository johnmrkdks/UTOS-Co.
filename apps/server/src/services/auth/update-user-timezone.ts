import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { users } from "@/db/sqlite/schema";

export const UpdateUserTimezoneServiceSchema = z.object({
	userId: z.string(),
	timezone: z.string().min(1, "Timezone is required"),
});

export type UpdateUserTimezoneParams = z.infer<
	typeof UpdateUserTimezoneServiceSchema
>;

export async function updateUserTimezoneService(
	db: DB,
	params: UpdateUserTimezoneParams,
) {
	const { userId, timezone } = params;

	// Update user timezone
	await db
		.update(users)
		.set({
			timezone,
			updatedAt: new Date(),
		})
		.where(eq(users.id, userId));

	return {
		success: true,
		message: "Timezone updated successfully",
	};
}
