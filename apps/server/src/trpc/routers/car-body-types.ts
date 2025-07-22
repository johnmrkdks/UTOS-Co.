import {
	InsertCarBodyTypeSchema,
	UpdateCarBodyTypeSchema,
} from "@/schemas/shared/tables/cars/car-body-type";
import { createCarBodyTypeService } from "@/services/cars-body-types/create-car-body-type";
import { deleteCarBodyTypeService } from "@/services/cars-body-types/delete-car-body-type";
import { getCarBodyTypeService } from "@/services/cars-body-types/get-car-body-type";
import { getCarBodyTypesService } from "@/services/cars-body-types/get-car-body-types";
import { updateCarBodyTypeService } from "@/services/cars-body-types/update-car-body-type";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carBodyTypesRouter = router({
	create: protectedProcedure
		.input(InsertCarBodyTypeSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarBodyType = await createCarBodyTypeService(db, input);
				return newCarBodyType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarBodyType = await deleteCarBodyTypeService(db, input.id);
				return deletedCarBodyType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carBodyType = await getCarBodyTypeService(db, input.id);
				return carBodyType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carBodyTypes = await getCarBodyTypesService(db, input);
				return carBodyTypes;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarBodyTypeSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarBodyType = await updateCarBodyTypeService(db, input);
				return updatedCarBodyType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

