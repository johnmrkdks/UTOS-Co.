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
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carFeaturesRouter = router({
	create: protectedProcedure
		.input(InsertCarFeatureSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newCarFeature = await createCarFeatureService(db, input);
			return newCarFeature;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedCarFeature = await deleteCarFeatureService(db, input);
			return deletedCarFeature;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const carFeature = await getCarFeatureService(db, input);
			return carFeature;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const carFeatures = await getCarFeaturesService(db, input);
			return carFeatures;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarFeatureSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedCarFeature = await updateCarFeatureService(db, input);
			return updatedCarFeature;
		}),
});

