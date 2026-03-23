import { eq, or, sql } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { UserRoleEnum } from "@/db/sqlite/enums";
import * as schema from "@/db/sqlite/schema";

export const DeleteUserServiceSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
});

export type DeleteUserServiceInput = z.infer<typeof DeleteUserServiceSchema>;

export async function deleteUserService(db: DB, input: DeleteUserServiceInput) {
	const { userId } = DeleteUserServiceSchema.parse(input);

	// Check if user exists
	const [user] = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.id, userId))
		.limit(1);

	if (!user) {
		throw new Error("User not found");
	}

	// Prevent deleting the last Super Admin
	if (user.role === UserRoleEnum.SuperAdmin) {
		const superAdminCount = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.users)
			.where(eq(schema.users.role, UserRoleEnum.SuperAdmin));
		if ((superAdminCount[0]?.count ?? 0) <= 1) {
			throw new Error(
				"Cannot delete the last Super Admin. Promote another user first.",
			);
		}
	}

	// If user is a driver, handle driver record and bookings
	const [driverRecord] = await db
		.select()
		.from(schema.drivers)
		.where(eq(schema.drivers.userId, userId))
		.limit(1);

	if (driverRecord) {
		// Unassign driver from all bookings
		await db
			.update(schema.bookings)
			.set({ driverId: null, driverAssignedAt: null })
			.where(eq(schema.bookings.driverId, driverRecord.id));

		// Clear driver references (approvedBy, verifiedBy) where this user approved/verified others
		await db
			.update(schema.drivers)
			.set({ approvedBy: null, verifiedBy: null })
			.where(
				or(
					eq(schema.drivers.approvedBy, userId),
					eq(schema.drivers.verifiedBy, userId),
				),
			);

		// Delete driver record
		await db
			.delete(schema.drivers)
			.where(eq(schema.drivers.id, driverRecord.id));
	}

	// Delete invoice sent logs (references user by sentByUserId)
	await db
		.delete(schema.invoiceSentLogs)
		.where(eq(schema.invoiceSentLogs.sentByUserId, userId));

	// Delete sessions
	await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));

	// Delete accounts
	await db.delete(schema.accounts).where(eq(schema.accounts.userId, userId));

	// Delete customer profiles
	await db
		.delete(schema.customerProfiles)
		.where(eq(schema.customerProfiles.userId, userId));

	// Delete ratings
	await db.delete(schema.ratings).where(eq(schema.ratings.userId, userId));

	// Delete bookings where user is the customer
	await db.delete(schema.bookings).where(eq(schema.bookings.userId, userId));

	// Delete user
	await db.delete(schema.users).where(eq(schema.users.id, userId));

	return {
		success: true,
		deletedUserId: userId,
		message: "User deleted successfully",
	};
}
