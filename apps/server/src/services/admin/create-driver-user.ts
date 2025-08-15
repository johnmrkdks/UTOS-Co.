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
		// Check if user already exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, input.email))
			.limit(1);

		if (existingUser.length > 0) {
			throw new Error("User with this email already exists");
		}

		// Hash the password
		const hashedPassword = await customHash(input.password);

		// Generate unique IDs
		const userId = `usr_${Math.random().toString(36).substr(2, 9)}`;
		const accountId = `acc_${Math.random().toString(36).substr(2, 9)}`;

		// Create user in the database (not verified by default)
		const newUser = await db
			.insert(users)
			.values({
				id: userId,
				email: input.email,
				name: input.name,
				emailVerified: false, // Drivers need to verify their email
				role: UserRoleEnum.Driver,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		// Create account entry for password authentication
		await db
			.insert(accounts)
			.values({
				id: accountId,
				accountId: input.email,
				providerId: "credential",
				userId: userId,
				password: hashedPassword,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

		return {
			success: true,
			user: newUser[0],
			message: `Driver account created successfully for ${input.email}. Default password: 'changeme'`,
		};
	} catch (error) {
		console.error("Error in createDriverUserService:", error);
		throw error;
	}
};