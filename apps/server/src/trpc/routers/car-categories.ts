
import {
	CreateCarCategoryServiceSchema,
	createCarCategoryService,
} from "@/services/cars-categories/create-car-category";
import {
	DeleteCarCategoryServiceSchema,
	deleteCarCategoryService,
} from "@/services/cars-categories/delete-car-category";
import {
	GetCarCategoryServiceSchema,
	getCarCategoryService,
} from "@/services/cars-categories/get-car-category";
import { getCarCategoriesService } from "@/services/cars-categories/get-car-categories";
import { getCarCategoriesWithEnrichedDataService } from "@/services/cars-categories/get-car-categories-with-enriched-data";
import { isCarCategoryExistService, IsCarCategoryExistServiceSchema } from "@/services/cars-categories/is-car-category-exist";
import {
	UpdateCarCategoryServiceSchema,
	updateCarCategoryService,
} from "@/services/cars-categories/update-car-category";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { checkCarCategoryUsageService, CheckCarCategoryUsageServiceSchema } from "@/services/cars-categories/check-car-category-usage";

export const carCategoriesRouter = router({
	checkUsage: protectedProcedure
		.input(CheckCarCategoryUsageServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const checkCarCategoryUsage = await checkCarCategoryUsageService(db, input);
				return checkCarCategoryUsage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	create: protectedProcedure
		.input(CreateCarCategoryServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarCategory = await createCarCategoryService(db, input);
				return newCarCategory;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarCategoryServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarCategory = await deleteCarCategoryService(db, input);
				return deletedCarCategory;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetCarCategoryServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carCategory = await getCarCategoryService(db, input);
				return carCategory;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	isCarCategoryExist: protectedProcedure
		.input(IsCarCategoryExistServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const isCarCategoryExist = await isCarCategoryExistService(db, input);
				return isCarCategoryExist;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carCategories = await getCarCategoriesService(db, input);
				return carCategories;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	listWithEnrichedData: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carCategories = await getCarCategoriesWithEnrichedDataService(db, input);
				return carCategories;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateCarCategoryServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarCategory = await updateCarCategoryService(db, input);
				return updatedCarCategory;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});
