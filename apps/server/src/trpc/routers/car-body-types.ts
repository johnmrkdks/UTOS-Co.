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
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carBodyTypesRouter = router({
	create: protectedProcedure
		.input(InsertCarBodyTypeSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newCarBodyType = await createCarBodyTypeService(db, input);
			return newCarBodyType;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedCarBodyType = await deleteCarBodyTypeService(db, input);
			return deletedCarBodyType;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const carBodyType = await getCarBodyTypeService(db, input);
			return carBodyType;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const carBodyTypes = await getCarBodyTypesService(db, input);
			return carBodyTypes;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarBodyTypeSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedCarBodyType = await updateCarBodyTypeService(db, input);
			return updatedCarBodyType;
		}),
});

