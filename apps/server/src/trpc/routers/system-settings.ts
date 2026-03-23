import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "@/trpc/init";
import { systemSettings } from "@/db/sqlite/schema/settings";
import { users } from "@/db/sqlite/schema/users";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { clearBookingReferencePrefixCache } from "@/utils/generate-booking-reference";
import type { DB } from "@/db";

// Helper function to get user role from database
const getUserRole = async (db: DB, userId: string) => {
	const user = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
	return user[0]?.role;
};

/**
 * System Settings Router
 * Manages global system configuration like timezone and booking reference prefix
 */
export const systemSettingsRouter = router({
	/**
	 * Get current system settings
	 * Public endpoint - allows frontend to fetch system defaults
	 */
	getSettings: publicProcedure.query(async ({ ctx }) => {
		const settings = await ctx.db.select().from(systemSettings).limit(1);

		// If no settings exist, create default settings
		if (settings.length === 0) {
			const [newSettings] = await ctx.db
				.insert(systemSettings)
				.values({
					id: 1,
					timezone: "Australia/Sydney",
					bookingReferencePrefix: "DUC",
				})
				.returning();

			return newSettings;
		}

		return settings[0];
	}),

	/**
	 * Update system timezone
	 * Admin only - requires super_admin or admin role
	 */
	updateTimezone: protectedProcedure
		.input(
			z.object({
				timezone: z.string().min(1, "Timezone is required"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if user is admin
			const userId = ctx.session?.user?.id || ctx.session?.session?.userId;
			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Authentication required",
				});
			}

			const userRole = await getUserRole(ctx.db, userId);
			if (!userRole || !["admin", "super_admin"].includes(userRole)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Admin access required",
				});
			}

			const [updated] = await ctx.db
				.update(systemSettings)
				.set({
					timezone: input.timezone,
					updatedAt: new Date(),
				})
				.where(eq(systemSettings.id, 1))
				.returning();

			return {
				success: true,
				settings: updated,
			};
		}),

	/**
	 * Update booking reference prefix
	 * Admin only - requires super_admin or admin role
	 */
	updateBookingReferencePrefix: protectedProcedure
		.input(
			z.object({
				prefix: z
					.string()
					.min(1, "Prefix must be at least 1 character")
					.max(10, "Prefix must be at most 10 characters")
					.regex(/^[A-Z0-9]+$/, "Prefix must contain only uppercase letters and numbers"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if user is admin
			const userId = ctx.session?.user?.id || ctx.session?.session?.userId;
			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Authentication required",
				});
			}

			const userRole = await getUserRole(ctx.db, userId);
			if (!userRole || !["admin", "super_admin"].includes(userRole)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Admin access required",
				});
			}

			const [updated] = await ctx.db
				.update(systemSettings)
				.set({
					bookingReferencePrefix: input.prefix,
					updatedAt: new Date(),
				})
				.where(eq(systemSettings.id, 1))
				.returning();

			// Clear the cached prefix so new bookings use the updated value
			clearBookingReferencePrefixCache();

			return {
				success: true,
				settings: updated,
			};
		}),

	/**
	 * Update all system settings at once
	 * Admin only - requires super_admin or admin role
	 */
	updateAllSettings: protectedProcedure
		.input(
			z.object({
				timezone: z.string().min(1, "Timezone is required").optional(),
				bookingReferencePrefix: z
					.string()
					.min(1, "Prefix must be at least 1 character")
					.max(10, "Prefix must be at most 10 characters")
					.regex(/^[A-Z0-9]+$/, "Prefix must contain only uppercase letters and numbers")
					.optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if user is admin
			const userId = ctx.session?.user?.id || ctx.session?.session?.userId;
			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Authentication required",
				});
			}

			const userRole = await getUserRole(ctx.db, userId);
			if (!userRole || !["admin", "super_admin"].includes(userRole)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Admin access required",
				});
			}

			const updateData: any = {
				updatedAt: new Date(),
			};

			if (input.timezone !== undefined) {
				updateData.timezone = input.timezone;
			}

			if (input.bookingReferencePrefix !== undefined) {
				updateData.bookingReferencePrefix = input.bookingReferencePrefix;
				// Clear the cached prefix
				clearBookingReferencePrefixCache();
			}

			const [updated] = await ctx.db
				.update(systemSettings)
				.set(updateData)
				.where(eq(systemSettings.id, 1))
				.returning();

			return {
				success: true,
				settings: updated,
			};
		}),
});
