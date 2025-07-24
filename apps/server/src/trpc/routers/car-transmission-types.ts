import {
	InsertCarTransmissionTypeSchema,
	UpdateCarTransmissionTypeSchema,
} from "@/schemas/shared/tables/cars/car-transmission-type";
import { createCarTransmissionTypeService, CreateCarTransmissionTypeServiceSchema } from "@/services/cars-transmission-types/create-car-transmission-type";
import { deleteCarTransmissionTypeService, DeleteCarTransmissionTypeServiceSchema } from "@/services/cars-transmission-types/delete-car-transmission-type";
import { getCarTransmissionTypeService, GetCarTransmissionTypeServiceSchema } from "@/services/cars-transmission-types/get-car-transmission-type";
import { getCarTransmissionTypesService } from "@/services/cars-transmission-types/get-car-transmission-types";
import { getCarTransmissionTypesWithEnrichedDataService } from "@/services/cars-transmission-types/get-car-transmission-types-with-enriched-data";
import { updateCarTransmissionTypeService, UpdateCarTransmissionTypeServiceSchema } from "@/services/cars-transmission-types/update-car-transmission-type";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { z } from "zod";

export const carTransmissionTypesRouter = router({
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

