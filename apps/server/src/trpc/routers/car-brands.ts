import {
	CheckCarBrandUsageServiceSchema,
	checkCarBrandUsageService,
} from "@/services/cars-brands/check-car-brand-usage";
import {
	CreateCarBrandServiceSchema,
	createCarBrandService,
} from "@/services/cars-brands/create-car-brand";
import {
	DeleteCarBrandServiceSchema,
	deleteCarBrandService,
} from "@/services/cars-brands/delete-car-brand";
import {
	GetCarBrandServiceSchema,
	getCarBrandService,
} from "@/services/cars-brands/get-car-brand";
import { getCarBrandsService } from "@/services/cars-brands/get-car-brands";
import { getCarBrandsWithEnrichedDataService } from "@/services/cars-brands/get-car-brands-with-enriched-data";
import { getCarBrandsWithModelsService } from "@/services/cars-brands/get-car-brands-with-models";
import {
	IsCarBrandExistServiceSchema,
	isCarBrandExistService,
} from "@/services/cars-brands/is-car-brand-exist";
import {
	UpdateCarBrandServiceSchema,
	updateCarBrandService,
} from "@/services/cars-brands/update-car-brand";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const carBrandsRouter = router({
	checkCarBrandUsage: protectedProcedure
		.input(CheckCarBrandUsageServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const checkCarBrandUsage = await checkCarBrandUsageService(db, input);
				return checkCarBrandUsage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	create: protectedProcedure
		.input(CreateCarBrandServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarBrand = await createCarBrandService(db, input);
				return newCarBrand;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarBrandServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarBrand = await deleteCarBrandService(db, input);
				return deletedCarBrand;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	isCarBrandExist: protectedProcedure
		.input(IsCarBrandExistServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const isCarBrandExist = await isCarBrandExistService(db, input);
				return isCarBrandExist;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetCarBrandServiceSchema)
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
				const carBrandsWithModels = await getCarBrandsWithModelsService(
					db,
					input,
				);
				return carBrandsWithModels;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	listWithEnrichedData: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carBrandsWithEnrichedData =
					await getCarBrandsWithEnrichedDataService(db, input);
				return carBrandsWithEnrichedData;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateCarBrandServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarBrand = await updateCarBrandService(db, input);
				return updatedCarBrand;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});
