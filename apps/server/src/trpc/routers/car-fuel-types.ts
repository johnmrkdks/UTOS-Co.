import {
	CreateCarFuelTypeServiceSchema,
	createCarFuelTypeService,
} from "@/services/cars-fuel-types/create-car-fuel-type";
import {
	DeleteCarFuelTypeServiceSchema,
	deleteCarFuelTypeService,
} from "@/services/cars-fuel-types/delete-car-fuel-type";
import {
	GetCarFuelTypeServiceSchema,
	getCarFuelTypeService,
} from "@/services/cars-fuel-types/get-car-fuel-type";
import { getCarFuelTypesService } from "@/services/cars-fuel-types/get-car-fuel-types";
import { getCarFuelTypesWithEnrichedDataService } from "@/services/cars-fuel-types/get-car-fuel-types-with-enriched-data";
import { isCarFuelTypeExistService, IsCarFuelTypeExistServiceSchema } from "@/services/cars-fuel-types/is-car-fuel-type-exist";
import {
	UpdateCarFuelTypeServiceSchema,
	updateCarFuelTypeService,
} from "@/services/cars-fuel-types/update-car-fuel-type";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { checkCarFuelTypeUsageService, CheckCarFuelTypeUsageServiceSchema } from "@/services/cars-fuel-types/check-car-fuel-type-usage";

export const carFuelTypesRouter = router({
	checkUsage: protectedProcedure
		.input(CheckCarFuelTypeUsageServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const checkCarFuelTypeUsage = await checkCarFuelTypeUsageService(db, input);
				return checkCarFuelTypeUsage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	create: protectedProcedure
		.input(CreateCarFuelTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarFuelType = await createCarFuelTypeService(db, input);
				return newCarFuelType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarFuelTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarFuelType = await deleteCarFuelTypeService(db, input);
				return deletedCarFuelType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetCarFuelTypeServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carFuelType = await getCarFuelTypeService(db, input);
				return carFuelType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	isCarFuelTypeExist: protectedProcedure
		.input(IsCarFuelTypeExistServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const isCarFuelTypeExist = await isCarFuelTypeExistService(db, input);
				return isCarFuelTypeExist;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carFuelTypes = await getCarFuelTypesService(db, input);
				return carFuelTypes;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	listWithEnrichedData: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carFuelTypesWithEnrichedData = await getCarFuelTypesWithEnrichedDataService(db, input);
				return carFuelTypesWithEnrichedData;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateCarFuelTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarFuelType = await updateCarFuelTypeService(db, input);
				return updatedCarFuelType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

