import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { accounts, users } from "@/db/sqlite/schema";
import { hashPasswordPbkdf2 } from "@/lib/pbkdf2-password";

export const SetPasswordForUserServiceSchema = z.object({
	userId: z.string().optional(), // Optional because it will be provided by session context
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SetPasswordForUserServiceInput = z.infer<
	typeof SetPasswordForUserServiceSchema
>;

export const setPasswordForUserService = async (
	db: DB,
	input: SetPasswordForUserServiceInput & { userId: string }, // Ensure userId is provided
) => {
	try {
		console.log("=== DEBUG: Starting setPasswordForUserService ===");
		console.log(
			"Input data:",
			JSON.stringify({ ...input, password: "[REDACTED]" }, null, 2),
		);

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

		const user = existingUser[0];
		console.log(
			"DEBUG: Found user:",
			JSON.stringify({ ...user, id: user.id }, null, 2),
		);

		// Check if user already has a credential account (password)
		console.log("DEBUG: Checking for existing credential account");
		const existingCredentialAccount = await db
			.select()
			.from(accounts)
			.where(
				and(
					eq(accounts.userId, input.userId),
					eq(accounts.providerId, "credential"),
				),
			)
			.limit(1);

		console.log(
			"DEBUG: Existing credential account check result:",
			existingCredentialAccount.length,
		);
		if (existingCredentialAccount.length > 0) {
			console.log("DEBUG: User already has password, throwing error");
			throw new Error(
				"User already has a password set. Use changePassword instead.",
			);
		}

		// Hash the password with PBKDF2 (Workers-friendly, stays within free tier CPU limit)
		console.log("DEBUG: Hashing password");
		const hashedPassword = await hashPasswordPbkdf2(input.password);
		console.log("DEBUG: Password hashed successfully");

		// Generate account ID
		const accountId = `acc_${Math.random().toString(36).substr(2, 9)}`;
		console.log("DEBUG: Generated account ID:", accountId);

		// Create credential account for the user
		console.log("DEBUG: Creating credential account");
		const credentialAccountData = {
			id: accountId,
			accountId: input.userId, // Should be userId
			providerId: "credential",
			userId: input.userId,
			password: hashedPassword,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		console.log(
			"DEBUG: Account insert data:",
			JSON.stringify(
				{
					...credentialAccountData,
					password: "[REDACTED]",
				},
				null,
				2,
			),
		);

		const newAccount = await db
			.insert(accounts)
			.values(credentialAccountData)
			.returning();

		console.log(
			"DEBUG: Credential account created successfully:",
			JSON.stringify(
				{
					...newAccount[0],
					password: "[REDACTED]",
				},
				null,
				2,
			),
		);

		console.log(
			"=== DEBUG: setPasswordForUserService completed successfully ===",
		);
		return {
			success: true,
			message:
				"Password set successfully. You can now sign in with your email and password.",
		};
	} catch (error) {
		console.error("=== ERROR in setPasswordForUserService ===");
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
