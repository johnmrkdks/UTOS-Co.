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
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carsConditionTypesRouter = router({
	create: protectedProcedure
		.input(InsertCarConditionTypeSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newCarConditionType = await createCarConditionTypeService(
				db,
				input,
			);
			return newCarConditionType;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedCarConditionType = await deleteCarConditionTypeService(
				db,
				input,
			);
			return deletedCarConditionType;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const carConditionType = await getCarConditionTypeService(db, input);
			return carConditionType;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const carConditionTypes = await getCarConditionTypesService(db, input);
			return carConditionTypes;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarConditionTypeSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedCarConditionType = await updateCarConditionTypeService(
				db,
				input.id,
				input.data,
			);
			return updatedCarConditionType;
		}),
});

