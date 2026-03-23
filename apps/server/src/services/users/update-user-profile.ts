import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { users } from "@/db/schema";

export const UpdateUserProfileServiceSchema = z.object({
	userId: z.string(),
	name: z.string().optional(),
	phone: z.string().optional(),
});

export type UpdateUserProfileParams = z.infer<
	typeof UpdateUserProfileServiceSchema
>;

export async function updateUserProfileService(
	db: DB,
	data: UpdateUserProfileParams,
) {
	console.log("=== DEBUG: Starting updateUserProfileService ===");
	console.log("Input data:", JSON.stringify(data, null, 2));

	const { userId, name, phone } = data;

	try {
		// First, get the current user
		const currentUser = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!currentUser) {
			throw new Error(`User not found with ID: ${userId}`);
		}

		console.log("DEBUG: Found user:", {
			id: currentUser.id,
			currentName: currentUser.name,
			currentPhone: (currentUser as any).phone,
		});

		// Prepare update data
		const userUpdateData: any = {
			updatedAt: new Date(),
		};

		if (name !== undefined && name !== currentUser.name) {
			userUpdateData.name = name;
			console.log("DEBUG: Will update user name to:", name);
		}

		if (phone !== undefined && phone !== (currentUser as any)?.phone) {
			userUpdateData.phone = phone;
			console.log("DEBUG: Will update user phone to:", phone);
		}

		// Check if any changes were made
		const hasChanges = Object.keys(userUpdateData).length > 1; // More than just updatedAt

		if (!hasChanges) {
			console.log("DEBUG: No changes detected, nothing to update");
			return currentUser;
		}

		// Execute the update
		console.log("DEBUG: Updating user with data:", userUpdateData);
		const [updatedUser] = await db
			.update(users)
			.set(userUpdateData)
			.where(eq(users.id, userId))
			.returning();

		console.log("DEBUG: User updated successfully:", {
			id: updatedUser.id,
			name: updatedUser.name,
			phone: (updatedUser as any).phone,
		});

		console.log(
			"=== DEBUG: updateUserProfileService completed successfully ===",
		);
		return updatedUser;
	} catch (error) {
		console.error("ERROR in updateUserProfileService:", error);
		throw error;
	}
}
