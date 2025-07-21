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
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carsModelsRouter = router({
	create: protectedProcedure
		.input(InsertCarModelSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newCarModel = await createCarModelService(db, input);
			return newCarModel;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedCarModel = await deleteCarModelService(db, input);
			return deletedCarModel;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const carModel = await getCarModelService(db, input);
			return carModel;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const carModels = await getCarModelsService(db, input);
			return carModels;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarModelSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedCarModel = await updateCarModelService(
				db,
				input,
			);
			return updatedCarModel;
		}),
});

