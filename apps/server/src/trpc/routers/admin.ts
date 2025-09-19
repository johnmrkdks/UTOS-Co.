import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { UserRoleEnum } from "@/db/sqlite/enums";
import { createDriverUserService, CreateDriverUserServiceSchema } from "@/services/admin/create-driver-user";
import { getAdminUsersService, GetAdminUsersServiceSchema } from "@/services/admin/get-admin-users";

export const adminRouter = router({
	createDriverUser: protectedProcedure
		.input(CreateDriverUserServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				console.log("=== tRPC DEBUG: createDriverUser mutation called ===");
				console.log("tRPC Input:", JSON.stringify(input, null, 2));
				console.log("tRPC DB context:", !!db ? "DB available" : "DB not available");

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