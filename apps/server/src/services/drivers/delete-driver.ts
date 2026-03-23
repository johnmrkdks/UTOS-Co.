import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { drivers } from "@/db/schema";
import { auth } from "@/lib/auth";
import * as schema from "@/db/sqlite/schema";

export const DeleteDriverServiceSchema = z.object({
	id: z.string().optional(),
	userId: z.string().optional(),
	forceDelete: z.boolean().default(false), // Require explicit confirmation for deletion
	confirmationText: z.string().optional(), // Require typing "DELETE" to confirm
}).refine((data) => data.id || data.userId, {
	message: "Either id or userId must be provided",
});

export type DeleteDriverServiceInput = z.infer<typeof DeleteDriverServiceSchema>;

export async function deleteDriverService(
	db: DB,
	input: DeleteDriverServiceInput,
) {
	const { id, userId, forceDelete, confirmationText } = DeleteDriverServiceSchema.parse(input);

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

	// Validation: Check for assigned bookings and confirmation requirements
	if (driverToDelete && targetUserId) {
		// Check for active/assigned bookings
		const activeBookings = await db
			.select({
				id: schema.bookings.id,
				status: schema.bookings.status,
				scheduledPickupTime: schema.bookings.scheduledPickupTime,
				originAddress: schema.bookings.originAddress,
				destinationAddress: schema.bookings.destinationAddress,
				customerName: schema.bookings.customerName,
			})
			.from(schema.bookings)
			.where(eq(schema.bookings.driverId, driverToDelete.id));

		const upcomingBookings = activeBookings.filter(booking => 
			!['completed', 'cancelled'].includes(booking.status) &&
			new Date(booking.scheduledPickupTime) > new Date()
		);

		const inProgressBookings = activeBookings.filter(booking => 
			['confirmed', 'driver_assigned', 'in_progress'].includes(booking.status)
		);

		// If driver has active bookings and force delete is not enabled, return warning
		if ((upcomingBookings.length > 0 || inProgressBookings.length > 0) && !forceDelete) {
			throw new Error(JSON.stringify({
				type: 'DRIVER_HAS_ACTIVE_BOOKINGS',
				message: 'Driver has active or upcoming bookings and cannot be deleted',
				details: {
					upcomingBookings: upcomingBookings.length,
					inProgressBookings: inProgressBookings.length,
					bookings: [...upcomingBookings, ...inProgressBookings].map(b => ({
						id: b.id,
						status: b.status,
						scheduledPickupTime: b.scheduledPickupTime,
						route: `${b.originAddress} → ${b.destinationAddress}`,
						customer: b.customerName,
					}))
				}
			}));
		}

		// Require hard confirmation for deletion
		if (!forceDelete || confirmationText !== 'DELETE') {
			throw new Error(JSON.stringify({
				type: 'CONFIRMATION_REQUIRED',
				message: 'Deletion requires explicit confirmation',
				details: {
					totalBookings: activeBookings.length,
					upcomingBookings: upcomingBookings.length,
					inProgressBookings: inProgressBookings.length,
					requiresConfirmation: true,
				}
			}));
		}

		// Log the deletion attempt for audit purposes
		console.log(`⚠️  DRIVER DELETION INITIATED:`, {
			driverId: driverToDelete.id,
			userId: targetUserId,
			totalBookings: activeBookings.length,
			upcomingBookings: upcomingBookings.length,
			inProgressBookings: inProgressBookings.length,
			forceDelete,
			confirmationProvided: confirmationText === 'DELETE'
		});
	}

	// Delete the associated user account and all related records
	if (targetUserId) {
		try {
			// Delete all records that reference the user (in correct order for foreign key constraints)
			// Note: D1 remote mode doesn't support transactions, so we do sequential deletions
			
			// 1. Clear any references to this user in drivers table (approvedBy, verifiedBy)
			await db.update(drivers)
				.set({ 
					approvedBy: null, 
					verifiedBy: null 
				})
				.where(
					sql`${drivers.approvedBy} = ${targetUserId} OR ${drivers.verifiedBy} = ${targetUserId}`
				);
			console.log(`Cleared driver references for user ${targetUserId}`);
			
			// 2. Delete sessions (references users.id)
			await db.delete(schema.sessions).where(eq(schema.sessions.userId, targetUserId));
			console.log(`Deleted sessions for user ${targetUserId}`);
			
			// 3. Delete accounts (references users.id)  
			await db.delete(schema.accounts).where(eq(schema.accounts.userId, targetUserId));
			console.log(`Deleted accounts for user ${targetUserId}`);
			
			// 4. Delete customer profiles (references users.id)
			await db.delete(schema.customerProfiles).where(eq(schema.customerProfiles.userId, targetUserId));
			console.log(`Deleted customer profiles for user ${targetUserId}`);
			
			// 5. Delete ratings (references users.id)
			await db.delete(schema.ratings).where(eq(schema.ratings.userId, targetUserId));
			console.log(`Deleted ratings for user ${targetUserId}`);
			
			// 6. Delete any bookings where this user is referenced
			// Note: Bookings reference users.id, so we need to delete those first
			await db.delete(schema.bookings).where(eq(schema.bookings.userId, targetUserId));
			console.log(`Deleted bookings for user ${targetUserId}`);
			
			// 7. Finally, delete the user record (this should now work without constraint violations)
			await db.delete(schema.users).where(eq(schema.users.id, targetUserId));
			console.log(`Successfully deleted user ${targetUserId}`);
			
			console.log(`Successfully removed user ${targetUserId} and all related records`);
		} catch (authError) {
			console.error("Failed to remove user:", authError);
			console.error("Error details:", authError);
			throw new Error(`Failed to remove user account: ${authError instanceof Error ? authError.message : 'Unknown error'}`);
		}
	}

	return { 
		success: true, 
		deletedDriverId: driverToDelete?.id || null,
		deletedUserId: targetUserId 
	};
}