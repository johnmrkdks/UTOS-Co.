import {
	InsertCarModelSchema,
	UpdateCarModelSchema,
} from "@/schemas/shared/tables/cars/car-model";
import { createCarModelService } from "@/services/cars-models/create-car-model";
import { deleteCarModelService } from "@/services/cars-models/delete-car-model";
import { getCarModelService } from "@/services/cars-models/get-car-model";
import { getCarModelsService } from "@/services/cars-models/get-car-models";
import { updateCarModelService } from "@/services/cars-models/update-car-model";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carModelsRouter = router({
	create: protectedProcedure
		.input(InsertCarModelSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarModel = await createCarModelService(db, input);
				return newCarModel;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarModel = await deleteCarModelService(db, input.id);
				return deletedCarModel;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carModel = await getCarModelService(db, input.id);
				return carModel;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carModels = await getCarModelsService(db, input);
				return carModels;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarModelSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarModel = await updateCarModelService(
					db,
					input,
				);
				return updatedCarModel;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

