import { z } from "zod";
import type { DB } from "@/db";
import { UserRoleEnum } from "@/db/sqlite/enums";
import { users, accounts } from "@/db/sqlite/schema";
import { hashPasswordPbkdf2 } from "@/lib/pbkdf2-password";
import { eq, and, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const UpdateUserCredentialsServiceSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	name: z.string().min(2, "Name must be at least 2 characters").optional(),
	email: z.string().email("Invalid email format").optional(),
	phone: z.string().optional(),
	password: z.string().min(8, "Password must be at least 8 characters").optional(),
	role: z.enum([UserRoleEnum.User, UserRoleEnum.Admin, UserRoleEnum.Driver, UserRoleEnum.SuperAdmin]).optional(),
});

export type UpdateUserCredentialsServiceInput = z.infer<typeof UpdateUserCredentialsServiceSchema>;

export const updateUserCredentialsService = async (
	db: DB,
	input: UpdateUserCredentialsServiceInput,
) => {
	try {
		// Check if user exists
		const [existingUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, input.userId))
			.limit(1);

		if (!existingUser) {
			throw new Error("User not found");
		}

		// If changing email, check uniqueness
		if (input.email && input.email !== existingUser.email) {
			const [emailTaken] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.email, input.email))
				.limit(1);
			if (emailTaken) {
				throw new Error("Email is already in use by another account");
			}
		}

		// If demoting a super_admin, ensure at least one super_admin remains
		if (
			input.role &&
			input.role !== UserRoleEnum.SuperAdmin &&
			existingUser.role === UserRoleEnum.SuperAdmin
		) {
			const superAdminCount = await db
				.select({ count: sql<number>`count(*)` })
				.from(users)
				.where(eq(users.role, UserRoleEnum.SuperAdmin));
			if ((superAdminCount[0]?.count ?? 0) <= 1) {
				throw new Error("Cannot demote the last Super Admin. Promote another user first.");
			}
		}

		// Build user update object
		const userUpdates: Partial<typeof users.$inferInsert> = {
			updatedAt: new Date(),
		};
		if (input.name !== undefined) userUpdates.name = input.name;
		if (input.email !== undefined) userUpdates.email = input.email;
		if (input.phone !== undefined) userUpdates.phone = input.phone;
		if (input.role !== undefined) userUpdates.role = input.role;

		if (Object.keys(userUpdates).length > 1) {
			await db.update(users).set(userUpdates).where(eq(users.id, input.userId));
		}

		// Handle password update
		if (input.password) {
			const [credentialAccount] = await db
				.select()
				.from(accounts)
				.where(
					and(
						eq(accounts.userId, input.userId),
						eq(accounts.providerId, "credential")
					)
				)
				.limit(1);

			const hashedPassword = await hashPasswordPbkdf2(input.password);

			if (credentialAccount) {
				await db
					.update(accounts)
					.set({
						password: hashedPassword,
						updatedAt: new Date(),
					})
					.where(eq(accounts.id, credentialAccount.id));
			} else {
				await db.insert(accounts).values({
					id: createId(),
					accountId: input.userId,
					providerId: "credential",
					userId: input.userId,
					password: hashedPassword,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}
		}

		const [updatedUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, input.userId))
			.limit(1);

		return {
			success: true,
			user: updatedUser,
			message: "User credentials updated successfully",
		};
	} catch (error) {
		console.error("Error in updateUserCredentialsService:", error);
		throw error;
	}
};
