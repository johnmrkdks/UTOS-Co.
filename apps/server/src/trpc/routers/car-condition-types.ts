import {
	CreateCarConditionTypeServiceSchema,
	createCarConditionTypeService,
} from "@/services/cars-condition-types/create-car-condition-type";
import {
	DeleteCarConditionTypeServiceSchema,
	deleteCarConditionTypeService,
} from "@/services/cars-condition-types/delete-car-condition-type";
import {
	GetCarConditionTypeServiceSchema,
	getCarConditionTypeService,
} from "@/services/cars-condition-types/get-car-condition-type";
import { getCarConditionTypesService } from "@/services/cars-condition-types/get-car-condition-types";
import { getCarConditionTypesWithEnrichedDataService } from "@/services/cars-condition-types/get-car-condition-types-with-enriched-data";
import { isCarConditionTypeExistService, IsCarConditionTypeExistServiceSchema } from "@/services/cars-condition-types/is-car-condition-type-exist";
import {
	UpdateCarConditionTypeServiceSchema,
	updateCarConditionTypeService,
} from "@/services/cars-condition-types/update-car-condition-type";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { checkCarConditionTypeUsageService, CheckCarConditionTypeUsageServiceSchema } from "@/services/cars-condition-types/check-car-condition-type-usage";

export const carConditionTypesRouter = router({
	checkUsage: protectedProcedure
		.input(CheckCarConditionTypeUsageServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const checkCarConditionTypeUsage = await checkCarConditionTypeUsageService(db, input);
				return checkCarConditionTypeUsage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	create: protectedProcedure
		.input(CreateCarConditionTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarConditionType = await createCarConditionTypeService(
					db,
					input,
				);
				return newCarConditionType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarConditionTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarConditionType = await deleteCarConditionTypeService(
					db,
					input,
				);
				return deletedCarConditionType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetCarConditionTypeServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carConditionType = await getCarConditionTypeService(db, input);
				return carConditionType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	isCarConditionTypeExist: protectedProcedure
		.input(IsCarConditionTypeExistServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const isCarConditionTypeExist = await isCarConditionTypeExistService(db, input);
				return isCarConditionTypeExist;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carConditionTypes = await getCarConditionTypesService(db, input);
				return carConditionTypes;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	listWithEnrichedData: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carConditionTypesWithEnrichedData =
					await getCarConditionTypesWithEnrichedDataService(db, input);
				return carConditionTypesWithEnrichedData;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateCarConditionTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarConditionType = await updateCarConditionTypeService(
					db,
					input,
				);
				return updatedCarConditionType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

