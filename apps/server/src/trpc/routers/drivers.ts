import { getDriversService } from "@/services/drivers/get-drivers";
import { getAvailableDriversService } from "@/services/drivers/get-available-drivers";
import { updateDriverService, UpdateDriverServiceSchema } from "@/services/drivers/update-driver";
import { createDriverApplicationService, CreateDriverApplicationServiceSchema } from "@/services/drivers/create-driver-application";
import { approveDriverApplicationService, ApproveDriverApplicationServiceSchema } from "@/services/drivers/approve-driver-application";
import { getDriversByStatusService, GetDriversByStatusServiceSchema } from "@/services/drivers/get-drivers-by-status";
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
	createApplication: protectedProcedure
		.input(CreateDriverApplicationServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newDriver = await createDriverApplicationService(db, input);
				return newDriver[0];
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
	listByStatus: protectedProcedure
		.input(GetDriversByStatusServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const drivers = await getDriversByStatusService(db, input);
				return drivers;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	approveApplication: protectedProcedure
		.input(ApproveDriverApplicationServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedDriver = await approveDriverApplicationService(db, input);
				return updatedDriver[0];
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