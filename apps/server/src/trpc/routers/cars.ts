import { InsertCarSchema, UpdateCarSchema } from "@/schemas/shared/tables/car";
import { createCarService, CreateCarServiceSchema } from "@/services/cars/create-car";
import { deleteCarService, DeleteCarServiceSchema } from "@/services/cars/delete-car";
import { getCarService, GetCarServiceSchema } from "@/services/cars/get-car";
import { getCarsService } from "@/services/cars/get-cars";
import { getPublishedCarsService } from "@/services/cars/get-published-cars";
import { getAvailableCars } from "@/services/cars/get-available-cars";
import { getCarPricingEstimateService, GetCarPricingEstimateSchema } from "@/services/cars/get-car-pricing-estimate";
import { togglePublishCarService, TogglePublishCarServiceSchema } from "@/services/cars/toggle-publish-car";
import { updateCarService, UpdateCarServiceSchema } from "@/services/cars/update-car";
import { protectedProcedure, publicProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { z } from "zod";

export const carsRouter = router({
	create: protectedProcedure
		.input(CreateCarServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCar = await createCarService(db, input);
				return newCar;
			} catch (error) {
				console.log(error);
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCar = await deleteCarService(db, input);
				return deletedCar;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetCarServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const car = await getCarService(db, input);
				return car;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const cars = await getCarsService(db, input);
				return cars;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateCarServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCar = await updateCarService(db, input);
				return updatedCar;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	
	togglePublish: protectedProcedure
		.input(TogglePublishCarServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCar = await togglePublishCarService(db, input);
				return updatedCar;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	
	// Public endpoints for customer-facing functionality
	listPublished: publicProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const cars = await getPublishedCarsService(db, input);
				return cars;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	getPublished: publicProcedure
		.input(GetCarServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const car = await getCarService(db, input);
				// Only return if car is published and available to customers
				if (!car?.isPublished || !car?.isActive || !car?.isAvailable) {
					throw new Error("Car not found or not available");
				}
				return car;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get available cars with time-based conflict checking
	listAvailable: protectedProcedure
		.input(ResourceListSchema.extend({
			scheduledPickupTime: z.string().datetime().optional(),
			estimatedDuration: z.number().optional(),
		}))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const { scheduledPickupTime, estimatedDuration, ...resourceListParams } = input;
				const availableCars = await getAvailableCars(db, {
					...resourceListParams,
					scheduledPickupTime: scheduledPickupTime ? new Date(scheduledPickupTime) : undefined,
					estimatedDuration
				});
				return { data: availableCars, count: availableCars.length };
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	
	getPricingEstimate: publicProcedure
		.input(GetCarPricingEstimateSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const pricing = await getCarPricingEstimateService(db, input);
				return pricing;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	
});
