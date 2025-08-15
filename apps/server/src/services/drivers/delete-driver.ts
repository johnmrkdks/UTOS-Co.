import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { drivers } from "@/db/schema";
import { users } from "@/db/schema";

export const DeleteDriverServiceSchema = z.object({
	id: z.string().optional(),
	userId: z.string().optional(),
}).refine((data) => data.id || data.userId, {
	message: "Either id or userId must be provided",
});

export type DeleteDriverServiceInput = z.infer<typeof DeleteDriverServiceSchema>;

export async function deleteDriverService(
	db: DB,
	input: DeleteDriverServiceInput,
) {
	const { id, userId } = DeleteDriverServiceSchema.parse(input);

	let driverToDelete: any = null;
	let targetUserId: string | null = null;

	if (id) {
		// Delete by driver ID
		const driverQuery = await db
			.select({
				id: drivers.id,
				userId: drivers.userId,
			})
			.from(drivers)
			.where(eq(drivers.id, id))
			.limit(1);

		if (driverQuery.length === 0) {
			throw new Error("Driver not found");
		}

		driverToDelete = driverQuery[0];
		targetUserId = driverToDelete.userId;

		// Delete the driver record
		await db.delete(drivers).where(eq(drivers.id, id));
	} else if (userId) {
		// Delete by user ID - first check if there's a driver record
		const driverQuery = await db
			.select({
				id: drivers.id,
				userId: drivers.userId,
			})
			.from(drivers)
			.where(eq(drivers.userId, userId))
			.limit(1);

		if (driverQuery.length > 0) {
			// Driver record exists, delete it first
			driverToDelete = driverQuery[0];
			await db.delete(drivers).where(eq(drivers.id, driverToDelete.id));
		}

		targetUserId = userId;
	}

	// Delete the associated user account
	if (targetUserId) {
		await db.delete(users).where(eq(users.id, targetUserId));
	}

	return { 
		success: true, 
		deletedDriverId: driverToDelete?.id || null,
		deletedUserId: targetUserId 
	};
}