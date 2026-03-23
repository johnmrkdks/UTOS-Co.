import {
	InsertCarTransmissionTypeSchema,
	UpdateCarTransmissionTypeSchema,
} from "@/schemas/shared/tables/cars/car-transmission-type";
import {
	CheckCarTransmissionTypeUsageServiceSchema,
	checkCarTransmissionTypeUsageService,
} from "@/services/cars-transmission-types/check-car-transmission-type-usage";
import {
	CreateCarTransmissionTypeServiceSchema,
	createCarTransmissionTypeService,
} from "@/services/cars-transmission-types/create-car-transmission-type";
import {
	DeleteCarTransmissionTypeServiceSchema,
	deleteCarTransmissionTypeService,
} from "@/services/cars-transmission-types/delete-car-transmission-type";
import {
	GetCarTransmissionTypeServiceSchema,
	getCarTransmissionTypeService,
} from "@/services/cars-transmission-types/get-car-transmission-type";
import { getCarTransmissionTypesService } from "@/services/cars-transmission-types/get-car-transmission-types";
import { getCarTransmissionTypesWithEnrichedDataService } from "@/services/cars-transmission-types/get-car-transmission-types-with-enriched-data";
import {
	IsCarTransmissionTypeExistServiceSchema,
	isCarTransmissionTypeExistService,
} from "@/services/cars-transmission-types/is-car-transmission-type-exist";
import {
	UpdateCarTransmissionTypeServiceSchema,
	updateCarTransmissionTypeService,
} from "@/services/cars-transmission-types/update-car-transmission-type";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const carTransmissionTypesRouter = router({
	checkUsage: protectedProcedure
		.input(CheckCarTransmissionTypeUsageServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const checkCarTransmissionTypeUsage =
					await checkCarTransmissionTypeUsageService(db, input);
				return checkCarTransmissionTypeUsage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	create: protectedProcedure
		.input(CreateCarTransmissionTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarTransmissionType = await createCarTransmissionTypeService(
					db,
					input,
				);
				return newCarTransmissionType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarTransmissionTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarTransmissionType =
					await deleteCarTransmissionTypeService(db, input);
				return deletedCarTransmissionType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetCarTransmissionTypeServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carTransmissionType = await getCarTransmissionTypeService(
					db,
					input,
				);
				return carTransmissionType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	isCarTransmissionTypeExist: protectedProcedure
		.input(IsCarTransmissionTypeExistServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const isCarTransmissionTypeExist =
					await isCarTransmissionTypeExistService(db, input);
				return isCarTransmissionTypeExist;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carTransmissionTypes = await getCarTransmissionTypesService(
					db,
					input,
				);
				return carTransmissionTypes;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	listWithEnrichedData: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carTransmissionTypesWithEnrichedData =
					await getCarTransmissionTypesWithEnrichedDataService(db, input);
				return carTransmissionTypesWithEnrichedData;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateCarTransmissionTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarTransmissionType =
					await updateCarTransmissionTypeService(db, input);
				return updatedCarTransmissionType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});
