import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { UserRoleEnum } from "@/db/sqlite/enums";
import { accounts, users } from "@/db/sqlite/schema";
import { hashPasswordPbkdf2 } from "@/lib/pbkdf2-password";

export const CreateDriverUserServiceSchema = z.object({
	email: z.string().email("Invalid email format"),
	name: z.string().min(2, "Name must be at least 2 characters"),
	password: z.string().default("changeme"),
});

export type CreateDriverUserServiceInput = z.infer<
	typeof CreateDriverUserServiceSchema
>;

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

		// Hash password with PBKDF2 (Workers-friendly, stays within free tier CPU limit)
		const hashedPassword = await hashPasswordPbkdf2(input.password);

		const userId = createId();
		const accountId = createId();

		// Create user
		const [newUser] = await db
			.insert(users)
			.values({
				id: userId,
				email: input.email,
				name: input.name,
				emailVerified: false,
				role: UserRoleEnum.Driver,
				image: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		// Create credential account (better-auth expects providerId "credential", accountId = userId for credential)
		await db.insert(accounts).values({
			id: accountId,
			accountId: userId,
			providerId: "credential",
			userId: userId,
			password: hashedPassword,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		return {
			success: true,
			user: newUser,
			message: `Driver account created successfully for ${input.email}. Default password: 'changeme'`,
		};
	} catch (error) {
		console.error("=== ERROR in createDriverUserService ===");
		console.error("Error:", error instanceof Error ? error.message : error);
		throw error;
	}
};
