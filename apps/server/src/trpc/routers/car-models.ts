import {
	InsertCarModelSchema,
	UpdateCarModelSchema,
} from "@/schemas/shared/tables/cars/car-model";
import { createCarModelService, CreateCarModelServiceSchema } from "@/services/cars-models/create-car-model";
import { deleteCarModelService, DeleteCarModelServiceSchema } from "@/services/cars-models/delete-car-model";
import { isCarModelExistService, IsCarModelExistServiceSchema } from "@/services/cars-models/is-car-model-exist";
import { getCarModelsWithEnrichedDataService } from "@/services/cars-models/get-car-brands-with-enriched-data";
import { getCarModelService, GetCarModelServiceSchema } from "@/services/cars-models/get-car-model";
import { getCarModelsService } from "@/services/cars-models/get-car-models";
import { getCarModelsWithBrandService } from "@/services/cars-models/get-car-models-with-brands";
import { updateCarModelService, UpdateCarModelServiceSchema } from "@/services/cars-models/update-car-model";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { z } from "zod";

export const carModelsRouter = router({
	create: protectedProcedure
		.input(CreateCarModelServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarModel = await createCarModelService(db, input);
				return newCarModel;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarModelServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarModel = await deleteCarModelService(db, input);
				return deletedCarModel;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	isCarModelExist: protectedProcedure
		.input(IsCarModelExistServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const isCarModelExist = await isCarModelExistService(db, input);
				return isCarModelExist;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetCarModelServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carModel = await getCarModelService(db, input);
				return carModel;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carModels = await getCarModelsService(db, input);
				return carModels;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	listWithBrand: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carModelsWithBrand = await getCarModelsWithBrandService(db, input);
				return carModelsWithBrand;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	listWithEnrichedData: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carModelsWithEnrichedData = await getCarModelsWithEnrichedDataService(db, input);
				return carModelsWithEnrichedData;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateCarModelServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarModel = await updateCarModelService(
					db,
					input,
				);
				return updatedCarModel;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

