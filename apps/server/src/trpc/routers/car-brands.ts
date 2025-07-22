import {
	InsertCarBrandSchema,
	UpdateCarBrandSchema,
} from "@/schemas/shared/tables/cars/car-brand";
import { createCarBrandService } from "@/services/cars-brands/create-car-brand";
import { deleteCarBrandService } from "@/services/cars-brands/delete-car-brand";
import { getCarBrandService } from "@/services/cars-brands/get-car-brand";
import { getCarBrandsService } from "@/services/cars-brands/get-car-brands";
import { getCarBrandsWithEnrichedDataService } from "@/services/cars-brands/get-car-brands-with-enriched-data";
import { getCarBrandsWithModelsService } from "@/services/cars-brands/get-car-brands-with-models";
import { updateCarBrandService } from "@/services/cars-brands/update-car-brand";
import { protectedProcedure, router } from "@/trpc/init";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";
import { handleTRPCError } from "@/trpc/utils/error-handler";

export const carBrandsRouter = router({
	create: protectedProcedure
		.input(InsertCarBrandSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarBrand = await createCarBrandService(db, input);
				return newCarBrand;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarBrand = await deleteCarBrandService(db, input);
				return deletedCarBrand;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carBrand = await getCarBrandService(db, input);
				return carBrand;
			} catch (error) {
				handleTRPCError(error);
			}
			const carBrand = await getCarBrandService(db, input);
			return carBrand;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carBrands = await getCarBrandsService(db, input);
				return carBrands;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	listWithModels: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carBrandsWithModels = await getCarBrandsWithModelsService(db, input);
				return carBrandsWithModels;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	listWithEnrichedData: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carBrandsWithEnrichedData = await getCarBrandsWithEnrichedDataService(db, input);
				return carBrandsWithEnrichedData;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarBrandSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarBrand = await updateCarBrandService(db, input);
				return updatedCarBrand;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

