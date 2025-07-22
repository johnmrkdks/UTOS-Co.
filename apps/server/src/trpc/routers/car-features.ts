import {
	InsertCarFeatureSchema,
	UpdateCarFeatureSchema,
} from "@/schemas/shared/tables/cars/car-feature";
import { createCarFeatureService } from "@/services/cars-features/create-car-feature";
import { deleteCarFeatureService } from "@/services/cars-features/delete-car-feature";
import { getCarFeatureService } from "@/services/cars-features/get-car-feature";
import { getCarFeaturesService } from "@/services/cars-features/get-car-features";
import { updateCarFeatureService } from "@/services/cars-features/update-car-feature";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carFeaturesRouter = router({
	create: protectedProcedure
		.input(InsertCarFeatureSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarFeature = await createCarFeatureService(db, input);
				return newCarFeature;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarFeature = await deleteCarFeatureService(db, input.id);
				return deletedCarFeature;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carFeature = await getCarFeatureService(db, input.id);
				return carFeature;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carFeatures = await getCarFeaturesService(db, input);
				return carFeatures;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarFeatureSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarFeature = await updateCarFeatureService(db, input);
				return updatedCarFeature;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

