import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { users } from "@/db/sqlite/schema";

export const UpdateUserProfileServiceSchema = z.object({
	userId: z.string().optional(), // Optional because it will be provided by session context
	name: z.string().min(1, "Name is required").optional(),
	phone: z.string().optional(), // Allow empty string or null to clear phone number
	// Note: Email updates should be handled separately with verification
});

export type UpdateUserProfileServiceInput = z.infer<
	typeof UpdateUserProfileServiceSchema
>;

export const updateUserProfileService = async (
	db: DB,
	input: UpdateUserProfileServiceInput & { userId: string }, // Ensure userId is provided
) => {
	try {
		console.log("=== DEBUG: Starting updateUserProfileService ===");
		console.log("Input data:", JSON.stringify(input, null, 2));

		// Check if user exists
		console.log("DEBUG: Checking if user exists with ID:", input.userId);
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.id, input.userId))
			.limit(1);

		console.log("DEBUG: User check result:", existingUser.length);
		if (existingUser.length === 0) {
			console.log("DEBUG: User not found, throwing error");
			throw new Error("User not found");
		}

		const currentUser = existingUser[0];
		console.log(
			"DEBUG: Current user data:",
			JSON.stringify(
				{
					id: currentUser.id,
					name: currentUser.name,
					phone: currentUser.phone,
				},
				null,
				2,
			),
		);

		// Prepare update data - only include fields that are provided
		const updateData: any = {
			updatedAt: new Date(),
		};

		if (input.name !== undefined) {
			updateData.name = input.name;
			console.log("DEBUG: Will update name to:", input.name);
		}

		if (input.phone !== undefined) {
			updateData.phone = input.phone || null; // Convert empty string to null
			console.log("DEBUG: Will update phone to:", updateData.phone);
		}

		// Update user profile
		console.log("DEBUG: Updating user profile with data:", updateData);
		const updatedUser = await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, input.userId))
			.returning();

		console.log("DEBUG: User profile updated successfully");
		console.log(
			"DEBUG: Updated user:",
			JSON.stringify(
				{
					id: updatedUser[0].id,
					name: updatedUser[0].name,
					phone: updatedUser[0].phone,
				},
				null,
				2,
			),
		);

		console.log(
			"=== DEBUG: updateUserProfileService completed successfully ===",
		);
		return {
			success: true,
			message: "Profile updated successfully.",
			user: updatedUser[0],
		};
	} catch (error) {
		console.error("=== ERROR in updateUserProfileService ===");
		console.error("Error type:", typeof error);
		console.error(
			"Error name:",
			error instanceof Error ? error.name : "Unknown",
		);
		console.error(
			"Error message:",
			error instanceof Error ? error.message : error,
		);
		console.error(
			"Error stack:",
			error instanceof Error ? error.stack : "No stack trace",
		);
		console.error("Full error object:", error);
		console.error("=== END ERROR LOG ===");
		throw error;
	}
};
