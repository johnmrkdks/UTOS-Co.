import { getDriversService } from "@/services/drivers/get-drivers";
import { getAvailableDriversService } from "@/services/drivers/get-available-drivers";
import { updateDriverService, UpdateDriverServiceSchema } from "@/services/drivers/update-driver";
import { assignDriverService, AssignDriverServiceSchema } from "@/services/bookings/assign-driver";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { z } from "zod";

export const driversRouter = router({
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const drivers = await getDriversService(db, input);
				return drivers;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	available: protectedProcedure
		.input(z.object({
			timeSlot: z.object({
				start: z.date(),
				end: z.date(),
			}).optional(),
		}).optional())
		.query(async ({ ctx: { db }, input }) => {
			try {
				const drivers = await getAvailableDriversService(db, input?.timeSlot);
				return drivers;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateDriverServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedDriver = await updateDriverService(db, input);
				return updatedDriver;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	assignToBooking: protectedProcedure
		.input(AssignDriverServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedBooking = await assignDriverService(db, input);
				return updatedBooking;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});