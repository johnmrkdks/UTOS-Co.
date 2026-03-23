import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { drivers, users } from "@/db/schema";

export const UpdateDriverProfileServiceSchema = z.object({
	driverId: z.string(),
	// User profile fields
	name: z.string().optional(),
	phone: z.string().optional(),
	// Driver-specific fields
	phoneNumber: z.string().optional(), // Driver's phone (can be different from user phone)
	address: z.string().optional(),
	dateOfBirth: z.number().optional(), // timestamp
	emergencyContactName: z.string().optional(),
	emergencyContactPhone: z.string().optional(),
	licenseNumber: z.string().optional(),
	licenseExpiry: z.number().optional(), // timestamp
});

export type UpdateDriverProfileParams = z.infer<
	typeof UpdateDriverProfileServiceSchema
>;

export async function updateDriverProfileService(
	db: DB,
	data: UpdateDriverProfileParams,
) {
	console.log("=== DEBUG: Starting updateDriverProfileService ===");
	console.log("Input data:", JSON.stringify(data, null, 2));

	const { driverId, name, phone, ...driverData } = data;

	try {
		// First, get the current driver to find the associated user
		const currentDriver = await db.query.drivers.findFirst({
			where: eq(drivers.id, driverId),
			with: {
				user: true,
			},
		});

		if (!currentDriver) {
			throw new Error(`Driver not found with ID: ${driverId}`);
		}

		console.log("DEBUG: Found driver:", {
			id: currentDriver.id,
			userId: currentDriver.userId,
			currentPhone: currentDriver.phoneNumber,
		});

		// Update user profile if name or phone changed
		if (
			(name !== undefined && name !== currentDriver.user?.name) ||
			(phone !== undefined && phone !== (currentDriver.user as any)?.phone)
		) {
			const userUpdateData: any = {
				updatedAt: new Date(),
			};

			if (name !== undefined && name !== currentDriver.user?.name) {
				userUpdateData.name = name;
				console.log("DEBUG: Will update user name to:", name);
			}

			if (phone !== undefined && phone !== (currentDriver.user as any)?.phone) {
				userUpdateData.phone = phone;
				console.log("DEBUG: Will update user phone to:", phone);
			}

			const [updatedUser] = await db
				.update(users)
				.set(userUpdateData)
				.where(eq(users.id, currentDriver.userId!))
				.returning();

			console.log("DEBUG: User updated successfully:", {
				id: updatedUser.id,
				name: updatedUser.name,
				phone: (updatedUser as any).phone,
			});
		}

		// Update driver-specific data
		const driverUpdateData: any = {
			updatedAt: new Date(),
			...driverData,
		};

		// Also update driver's phoneNumber field if phone was provided
		if (phone !== undefined) {
			driverUpdateData.phoneNumber = phone;
		}

		// Convert ALL timestamp fields to Date objects (Drizzle SQLite timestamp mode expects Date objects)
		if (driverUpdateData.dateOfBirth !== undefined) {
			if (typeof driverUpdateData.dateOfBirth === "number") {
				// Convert milliseconds to Date object
				driverUpdateData.dateOfBirth = new Date(driverUpdateData.dateOfBirth);
			}
		}

		if (driverUpdateData.licenseExpiry !== undefined) {
			if (typeof driverUpdateData.licenseExpiry === "number") {
				// Convert milliseconds to Date object
				driverUpdateData.licenseExpiry = new Date(
					driverUpdateData.licenseExpiry,
				);
			}
		}

		// updatedAt is already a Date object, no conversion needed

		// Remove undefined values to avoid overwriting with null
		Object.keys(driverUpdateData).forEach((key) => {
			if (driverUpdateData[key] === undefined) {
				delete driverUpdateData[key];
			}
		});

		console.log("DEBUG: Raw driverData before processing:", driverData);
		console.log(
			"DEBUG: dateOfBirth AFTER conversion:",
			driverUpdateData.dateOfBirth,
			"length:",
			driverUpdateData.dateOfBirth?.toString().length,
		);
		console.log(
			"DEBUG: licenseExpiry AFTER conversion:",
			driverUpdateData.licenseExpiry,
			"length:",
			driverUpdateData.licenseExpiry?.toString().length,
		);
		console.log(
			"DEBUG: Final driverUpdateData after timestamp conversion:",
			driverUpdateData,
		);

		const [updatedDriver] = await db
			.update(drivers)
			.set(driverUpdateData)
			.where(eq(drivers.id, driverId))
			.returning();

		console.log("DEBUG: Driver updated successfully:", {
			id: updatedDriver.id,
			phoneNumber: updatedDriver.phoneNumber,
			address: updatedDriver.address,
		});

		// Return the updated driver with user data
		const result = await db.query.drivers.findFirst({
			where: eq(drivers.id, driverId),
			with: {
				user: true,
			},
		});

		console.log(
			"=== DEBUG: updateDriverProfileService completed successfully ===",
		);
		return result;
	} catch (error) {
		console.error("ERROR in updateDriverProfileService:", error);
		throw error;
	}
}
