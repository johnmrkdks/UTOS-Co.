import {
	CreateCarFeatureServiceSchema,
	createCarFeatureService,
} from "@/services/cars-features/create-car-feature";
import {
	DeleteCarFeatureServiceSchema,
	deleteCarFeatureService,
} from "@/services/cars-features/delete-car-feature";
import {
	GetCarFeatureServiceSchema,
	getCarFeatureService,
} from "@/services/cars-features/get-car-feature";
import { getCarFeaturesService } from "@/services/cars-features/get-car-features";
import {
	UpdateCarFeatureServiceSchema,
	updateCarFeatureService,
} from "@/services/cars-features/update-car-feature";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";

export const carFeaturesRouter = router({
	create: protectedProcedure
		.input(CreateCarFeatureServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarFeature = await createCarFeatureService(db, input);
				return newCarFeature;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarFeatureServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarFeature = await deleteCarFeatureService(db, input);
				return deletedCarFeature;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetCarFeatureServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carFeature = await getCarFeatureService(db, input);
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
		.input(UpdateCarFeatureServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarFeature = await updateCarFeatureService(db, input);
				return updatedCarFeature;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

