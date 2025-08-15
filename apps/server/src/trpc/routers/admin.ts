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
				const result = await createDriverUserService(db, input);
				return result;
			} catch (error) {
				console.error("Error creating driver user:", error);
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