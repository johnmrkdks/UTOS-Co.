import { z } from "zod";
import { InsertCarSchema, UpdateCarSchema } from "@/schemas/shared/tables/car";
import {
	CreateCarServiceSchema,
	createCarService,
} from "@/services/cars/create-car";
import {
	DeleteCarServiceSchema,
	deleteCarService,
} from "@/services/cars/delete-car";
import { getAvailableCars } from "@/services/cars/get-available-cars";
import { GetCarServiceSchema, getCarService } from "@/services/cars/get-car";
import {
	GetCarPricingEstimateSchema,
	getCarPricingEstimateService,
} from "@/services/cars/get-car-pricing-estimate";
import { getCarsService } from "@/services/cars/get-cars";
import { getPublishedCarHourlyRateService } from "@/services/cars/get-published-car-hourly-rate";
import { getPublishedCarsService } from "@/services/cars/get-published-cars";
import { getPublishedCarsWithHourlyPricingService } from "@/services/cars/get-published-cars-with-hourly-pricing";
import {
	TogglePublishCarServiceSchema,
	togglePublishCarService,
} from "@/services/cars/toggle-publish-car";
import {
	UpdateCarServiceSchema,
	updateCarService,
} from "@/services/cars/update-car";
import { protectedProcedure, publicProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { transformCarImages } from "@/utils/image-url";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const carsRouter = router({
	create: protectedProcedure
		.input(CreateCarServiceSchema)
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				const newCar = await createCarService(db, input);
				return transformCarImages(newCar, env.BETTER_AUTH_URL || "");
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
		.query(async ({ ctx: { db, env }, input }) => {
			try {
				const car = await getCarService(db, input);
				return car ? transformCarImages(car, env.BETTER_AUTH_URL || "") : car;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db, env }, input }) => {
			try {
				const result = await getCarsService(db, input);
				const baseUrl = env.BETTER_AUTH_URL || "";
				return {
					...result,
					data:
						result.data?.map((car) => transformCarImages(car, baseUrl)) ??
						result.data,
				};
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateCarServiceSchema)
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				const updatedCar = await updateCarService(db, input);
				return updatedCar
					? transformCarImages(updatedCar, env.BETTER_AUTH_URL || "")
					: updatedCar;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	togglePublish: protectedProcedure
		.input(TogglePublishCarServiceSchema)
		.mutation(async ({ ctx: { db, env }, input }) => {
			try {
				const updatedCar = await togglePublishCarService(db, input);
				return updatedCar
					? transformCarImages(updatedCar, env.BETTER_AUTH_URL || "")
					: updatedCar;
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Public endpoints for customer-facing functionality
	listPublished: publicProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db, env }, input }) => {
			try {
				const result = await getPublishedCarsService(db, input);
				const baseUrl = env.BETTER_AUTH_URL || "";
				return {
					...result,
					data:
						result.data?.map((car) => transformCarImages(car, baseUrl)) ??
						result.data,
				};
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	/** Cars with hourly rate set in pricing config (marketing instant quote hourly). */
	listPublishedWithHourlyPricing: publicProcedure.query(
		async ({ ctx: { db } }) => {
			try {
				return await getPublishedCarsWithHourlyPricingService(db);
			} catch (error) {
				handleTRPCError(error);
			}
		},
	),

	/** Resolve hourly rate from pricing config for a published car (booking page). */
	getPublishedCarHourlyRate: publicProcedure
		.input(z.object({ carId: z.string().min(1) }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const hourlyRate = await getPublishedCarHourlyRateService(
					db,
					input.carId,
				);
				return { hourlyRate };
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	getPublished: publicProcedure
		.input(GetCarServiceSchema)
		.query(async ({ ctx: { db, env }, input }) => {
			try {
				const car = await getCarService(db, input);
				// Only return if car is published and available to customers
				if (!car?.isPublished || !car?.isActive || !car?.isAvailable) {
					throw new Error("Car not found or not available");
				}
				return transformCarImages(car, env.BETTER_AUTH_URL || "");
			} catch (error) {
				handleTRPCError(error);
			}
		}),

	// Get available cars with time-based conflict checking
	listAvailable: protectedProcedure
		.input(
			ResourceListSchema.extend({
				scheduledPickupTime: z.string().datetime().optional(),
				estimatedDuration: z.number().optional(),
			}),
		)
		.query(async ({ ctx: { db, env }, input }) => {
			try {
				const {
					scheduledPickupTime,
					estimatedDuration,
					...resourceListParams
				} = input;
				const availableCars = await getAvailableCars(db, {
					...resourceListParams,
					scheduledPickupTime: scheduledPickupTime
						? new Date(scheduledPickupTime)
						: undefined,
					estimatedDuration,
				});
				const baseUrl = env.BETTER_AUTH_URL || "";
				const transformed = availableCars.map((car) =>
					transformCarImages(car, baseUrl),
				);
				return { data: transformed, count: transformed.length };
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
