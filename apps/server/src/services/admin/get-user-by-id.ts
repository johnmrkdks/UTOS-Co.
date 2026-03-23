import { z } from "zod";
import type { DB } from "@/db";
import { users } from "@/db/sqlite/schema";
import { eq } from "drizzle-orm";

export const GetUserByIdServiceSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
});

export type GetUserByIdServiceInput = z.infer<typeof GetUserByIdServiceSchema>;

export const getUserByIdService = async (db: DB, input: GetUserByIdServiceInput) => {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.id, input.userId))
		.limit(1);

	if (!user) {
		throw new Error("User not found");
	}

	return user;
};
