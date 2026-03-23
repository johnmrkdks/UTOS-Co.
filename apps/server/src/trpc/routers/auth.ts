import { z } from "zod";
import {
	GetUserAccountsServiceSchema,
	getUserAccountsService,
} from "@/services/auth/get-user-accounts";
import {
	SetPasswordForUserServiceSchema,
	setPasswordForUserService,
} from "@/services/auth/set-password-for-user";
import {
	UpdateUserPhoneServiceSchema,
	updateUserPhoneService,
} from "@/services/auth/update-user-phone";
import {
	UpdateUserProfileServiceSchema,
	updateUserProfileService,
} from "@/services/auth/update-user-profile";
import {
	UpdateUserTimezoneServiceSchema,
	updateUserTimezoneService,
} from "@/services/auth/update-user-timezone";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";

export const authRouter = router({
	// Set password for users who only have social accounts (like Google)
	setPassword: protectedProcedure
		.input(SetPasswordForUserServiceSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				if (!session?.user?.id) {
					throw new Error("User not authenticated");
				}

				const result = await setPasswordForUserService(db, {
					userId: session.user.id,
					password: input.password,
				});

				return result;
			} catch (error) {
				console.error("Error setting password for user:", error);
				handleTRPCError(error);
			}
		}),

	// Get user accounts to determine what authentication methods they have
	getUserAccounts: protectedProcedure.query(
		async ({ ctx: { db, session } }) => {
			try {
				if (!session?.user?.id) {
					throw new Error("User not authenticated");
				}

				const result = await getUserAccountsService(db, {
					userId: session.user.id,
				});

				return result;
			} catch (error) {
				console.error("Error getting user accounts:", error);
				handleTRPCError(error);
			}
		},
	),

	// Update user phone number (not handled by Better Auth)
	updateUserPhone: protectedProcedure
		.input(UpdateUserPhoneServiceSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				if (!session?.user?.id) {
					throw new Error("User not authenticated");
				}

				const result = await updateUserPhoneService(db, {
					userId: session.user.id,
					phone: input.phone,
				});

				return result;
			} catch (error) {
				console.error("Error updating user phone:", error);
				handleTRPCError(error);
			}
		}),

	// Update user profile (comprehensive - replaces Better Auth updateUser)
	updateUserProfile: protectedProcedure
		.input(UpdateUserProfileServiceSchema)
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				if (!session?.user?.id) {
					throw new Error("User not authenticated");
				}

				const result = await updateUserProfileService(db, {
					userId: session.user.id,
					name: input.name,
					phone: input.phone,
				});

				return result;
			} catch (error) {
				console.error("Error updating user profile:", error);
				handleTRPCError(error);
			}
		}),

	// Update user timezone (auto-called on login from frontend)
	updateUserTimezone: protectedProcedure
		.input(z.object({ timezone: z.string() }))
		.mutation(async ({ ctx: { db, session }, input }) => {
			try {
				if (!session?.user?.id) {
					throw new Error("User not authenticated");
				}

				const result = await updateUserTimezoneService(db, {
					userId: session.user.id,
					timezone: input.timezone,
				});

				return result;
			} catch (error) {
				console.error("Error updating user timezone:", error);
				handleTRPCError(error);
			}
		}),
});
