import { z } from "zod";
import {
	CreateDriverUserServiceSchema,
	createDriverUserService,
} from "@/services/admin/create-driver-user";
import {
	CreateUserServiceSchema,
	createUserService,
} from "@/services/admin/create-user";
import {
	DeleteUserServiceSchema,
	deleteUserService,
} from "@/services/admin/delete-user";
import {
	GetAdminUsersServiceSchema,
	getAdminUsersService,
} from "@/services/admin/get-admin-users";
import {
	GetUserByIdServiceSchema,
	getUserByIdService,
} from "@/services/admin/get-user-by-id";
import {
	UpdateUserCredentialsServiceSchema,
	updateUserCredentialsService,
} from "@/services/admin/update-user-credentials";
import { protectedProcedure, router, superAdminProcedure } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";

export const adminRouter = router({
	/** Super Admin only: Get user by ID */
	getUser: superAdminProcedure
		.input(GetUserByIdServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				return await getUserByIdService(db, input);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	/** Super Admin only: Update any user's credentials (name, email, phone, password, role) */
	updateUserCredentials: superAdminProcedure
		.input(UpdateUserCredentialsServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				return await updateUserCredentialsService(db, input);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	/** Super Admin only: Delete any user */
	deleteUser: superAdminProcedure
		.input(DeleteUserServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				return await deleteUserService(db, input);
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	/** Super Admin only: Create Client or Admin user */
	createUser: superAdminProcedure
		.input(CreateUserServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const result = await createUserService(db, input);
				return result;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	createDriverUser: protectedProcedure
		.input(CreateDriverUserServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const result = await createDriverUserService(db, input);

				console.log("=== tRPC DEBUG: createDriverUser mutation successful ===");
				console.log("tRPC Result:", JSON.stringify(result, null, 2));
				return result;
			} catch (error) {
				console.error("=== tRPC ERROR: createDriverUser mutation failed ===");
				console.error("tRPC Error type:", typeof error);
				console.error(
					"tRPC Error name:",
					error instanceof Error ? error.name : "Unknown",
				);
				console.error(
					"tRPC Error message:",
					error instanceof Error ? error.message : error,
				);
				console.error(
					"tRPC Error stack:",
					error instanceof Error ? error.stack : "No stack trace",
				);
				console.error("=== tRPC END ERROR ===");
				handleTRPCError(error);
			}
		}),

	listUsers: protectedProcedure
		.input(GetAdminUsersServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const result = await getAdminUsersService(db, input);
				return result;
			} catch (error) {
				console.error("Error listing users:", error);
				handleTRPCError(error);
			}
		}),
});
