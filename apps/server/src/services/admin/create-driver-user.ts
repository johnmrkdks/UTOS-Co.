import { z } from "zod";
import type { DB } from "@/db";
import { UserRoleEnum } from "@/db/sqlite/enums";
import { users, accounts } from "@/db/sqlite/schema";
import { customHash } from "@/lib/scrypt";
import { eq } from "drizzle-orm";

export const CreateDriverUserServiceSchema = z.object({
	email: z.string().email("Invalid email format"),
	name: z.string().min(2, "Name must be at least 2 characters"),
	password: z.string().default("changeme"),
});

export type CreateDriverUserServiceInput = z.infer<typeof CreateDriverUserServiceSchema>;

export const createDriverUserService = async (
	db: DB,
	input: CreateDriverUserServiceInput,
) => {
	try {
		console.log("=== DEBUG: Starting createDriverUserService ===");
		console.log("Input data:", JSON.stringify(input, null, 2));

		// Check if user already exists
		console.log("DEBUG: Checking if user exists with email:", input.email);
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, input.email))
			.limit(1);

		console.log("DEBUG: Existing user check result:", existingUser.length);
		if (existingUser.length > 0) {
			console.log("DEBUG: User already exists, throwing error");
			throw new Error("User with this email already exists");
		}

		// Hash the password
		console.log("DEBUG: Hashing password");
		const hashedPassword = await customHash(input.password);
		console.log("DEBUG: Password hashed successfully");

		// Generate unique IDs
		const userId = `usr_${Math.random().toString(36).substr(2, 9)}`;
		const accountId = `acc_${Math.random().toString(36).substr(2, 9)}`;
		console.log("DEBUG: Generated IDs - userId:", userId, "accountId:", accountId);

		// Create user in the database (not verified by default)
		console.log("DEBUG: Creating user in database");
		const userInsertData = {
			id: userId,
			email: input.email,
			name: input.name,
			emailVerified: false, // Driver needs to verify their email
			role: UserRoleEnum.Driver,
			image: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		console.log("DEBUG: User insert data:", JSON.stringify(userInsertData, null, 2));

		const newUser = await db
			.insert(users)
			.values(userInsertData)
			.returning();

		console.log("DEBUG: User created successfully:", JSON.stringify(newUser[0], null, 2));

		// Create account entry for password authentication
		console.log("DEBUG: Creating account in database");
		const accountInsertData = {
			id: accountId,
			accountId: userId, // Should be userId, not email
			providerId: "credential",
			userId: userId,
			password: hashedPassword,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		console.log("DEBUG: Account insert data:", JSON.stringify({
			...accountInsertData,
			password: "[REDACTED]"
		}, null, 2));

		const newAccount = await db
			.insert(accounts)
			.values(accountInsertData)
			.returning();

		console.log("DEBUG: Account created successfully:", JSON.stringify({
			...newAccount[0],
			password: "[REDACTED]"
		}, null, 2));

		console.log("=== DEBUG: createDriverUserService completed successfully ===");
		return {
			success: true,
			user: newUser[0],
			account: newAccount[0],
			message: `Driver account created successfully for ${input.email}. Default password: 'changeme'`,
		};
	} catch (error) {
		console.error("=== ERROR in createDriverUserService ===");
		console.error("Error type:", typeof error);
		console.error("Error name:", error instanceof Error ? error.name : "Unknown");
		console.error("Error message:", error instanceof Error ? error.message : error);
		console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
		console.error("Full error object:", error);
		console.error("=== END ERROR LOG ===");
		throw error;
	}
};