import {
	InsertCarTransmissionTypeSchema,
	UpdateCarTransmissionTypeSchema,
} from "@/schemas/shared/tables/cars/car-transmission-type";
import { createCarTransmissionTypeService } from "@/services/cars-transmission-types/create-car-transmission-type";
import { deleteCarTransmissionTypeService } from "@/services/cars-transmission-types/delete-car-transmission-type";
import { getCarTransmissionTypeService } from "@/services/cars-transmission-types/get-car-transmission-type";
import { getCarTransmissionTypesService } from "@/services/cars-transmission-types/get-car-transmission-types";
import { updateCarTransmissionTypeService } from "@/services/cars-transmission-types/update-car-transmission-type";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carTransmissionTypesRouter = router({
	create: protectedProcedure
		.input(InsertCarTransmissionTypeSchema)
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
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarTransmissionType =
					await deleteCarTransmissionTypeService(db, input.id);
				return deletedCarTransmissionType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carTransmissionType = await getCarTransmissionTypeService(
					db,
					input.id,
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
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarTransmissionTypeSchema }))
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

