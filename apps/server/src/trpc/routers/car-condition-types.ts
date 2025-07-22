import {
	InsertCarConditionTypeSchema,
	UpdateCarConditionTypeSchema,
} from "@/schemas/shared/tables/cars/car-condition-type";
import { createCarConditionTypeService } from "@/services/cars-condition-types/create-car-condition-type";
import { deleteCarConditionTypeService } from "@/services/cars-condition-types/delete-car-condition-type";
import { getCarConditionTypeService } from "@/services/cars-condition-types/get-car-condition-type";
import { getCarConditionTypesService } from "@/services/cars-condition-types/get-car-condition-types";
import { updateCarConditionTypeService } from "@/services/cars-condition-types/update-car-condition-type";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carConditionTypesRouter = router({
	create: protectedProcedure
		.input(InsertCarConditionTypeSchema)
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
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarConditionType = await deleteCarConditionTypeService(
					db,
					input.id,
				);
				return deletedCarConditionType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carConditionType = await getCarConditionTypeService(db, input.id);
				return carConditionType;
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
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarConditionTypeSchema }))
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

