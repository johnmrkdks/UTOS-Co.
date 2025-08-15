import { z } from "zod";
import type { DB } from "@/db";
import { UserRoleEnum } from "@/db/sqlite/enums";
import { users } from "@/db/sqlite/schema";
import { eq, sql, desc } from "drizzle-orm";

export const GetAdminUsersServiceSchema = z.object({
	role: z.enum([UserRoleEnum.User, UserRoleEnum.Driver, UserRoleEnum.Admin, UserRoleEnum.SuperAdmin]).optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export type GetAdminUsersServiceInput = z.infer<typeof GetAdminUsersServiceSchema>;

export const getAdminUsersService = async (
	db: DB,
	input: GetAdminUsersServiceInput,
) => {
	try {
		// Build the where condition
		const whereCondition = input.role ? eq(users.role, input.role) : undefined;

		// Get users with proper typing
		const usersResult = await db
			.select()
			.from(users)
			.where(whereCondition)
			.orderBy(desc(users.createdAt))
			.limit(input.limit)
			.offset(input.offset);

		// Get total count for pagination
		const countResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(users)
			.where(whereCondition);
		
		const count = countResult[0]?.count || 0;

		return {
			users: usersResult,
			totalItems: count,
			limit: input.limit,
			offset: input.offset,
			hasNextPage: input.offset + input.limit < count,
			hasPreviousPage: input.offset > 0,
		};
	} catch (error) {
		console.error("Error in getAdminUsersService:", error);
		throw error;
	}
};