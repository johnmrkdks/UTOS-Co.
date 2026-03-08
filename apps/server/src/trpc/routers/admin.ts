import { z } from "zod";
import { protectedProcedure, superAdminProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { createDriverUserService, CreateDriverUserServiceSchema } from "@/services/admin/create-driver-user";
import { createUserService, CreateUserServiceSchema } from "@/services/admin/create-user";
import { getAdminUsersService, GetAdminUsersServiceSchema } from "@/services/admin/get-admin-users";
import { getUserByIdService, GetUserByIdServiceSchema } from "@/services/admin/get-user-by-id";
import { updateUserCredentialsService, UpdateUserCredentialsServiceSchema } from "@/services/admin/update-user-credentials";
import { deleteUserService, DeleteUserServiceSchema } from "@/services/admin/delete-user";

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
				console.error("tRPC Error name:", error instanceof Error ? error.name : "Unknown");
				console.error("tRPC Error message:", error instanceof Error ? error.message : error);
				console.error("tRPC Error stack:", error instanceof Error ? error.stack : "No stack trace");
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