import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { users } from "@/db/sqlite/schema";

export const UpdateUserPhoneServiceSchema = z.object({
	userId: z.string().optional(), // Optional because it will be provided by session context
	phone: z.string().optional(), // Allow empty string or null to clear phone number
});

export type UpdateUserPhoneServiceInput = z.infer<
	typeof UpdateUserPhoneServiceSchema
>;

export const updateUserPhoneService = async (
	db: DB,
	input: UpdateUserPhoneServiceInput & { userId: string }, // Ensure userId is provided
) => {
	try {
		console.log("=== DEBUG: Starting updateUserPhoneService ===");
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

		// Update user phone number
		console.log("DEBUG: Updating user phone number to:", input.phone);
		const updatedUser = await db
			.update(users)
			.set({
				phone: input.phone || null, // Allow clearing phone number
				updatedAt: new Date(),
			})
			.where(eq(users.id, input.userId))
			.returning();

		console.log("DEBUG: User phone updated successfully");
		console.log("=== DEBUG: updateUserPhoneService completed successfully ===");
		return {
			success: true,
			message: "Phone number updated successfully.",
			user: updatedUser[0],
		};
	} catch (error) {
		console.error("=== ERROR in updateUserPhoneService ===");
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
