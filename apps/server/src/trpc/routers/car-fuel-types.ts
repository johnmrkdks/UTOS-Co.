import {
	InsertCarFuelTypeSchema,
	UpdateCarFuelTypeSchema,
} from "@/schemas/shared/tables/cars/car-fuel-type";
import { createCarFuelTypeService } from "@/services/cars-fuel-types/create-car-fuel-type";
import { deleteCarFuelTypeService } from "@/services/cars-fuel-types/delete-car-fuel-type";
import { getCarFuelTypeService } from "@/services/cars-fuel-types/get-car-fuel-type";
import { getCarFuelTypesService } from "@/services/cars-fuel-types/get-car-fuel-types";
import { updateCarFuelTypeService } from "@/services/cars-fuel-types/update-car-fuel-type";
import { protectedProcedure, router } from "@/trpc/init";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carFuelTypesRouter = router({
	create: protectedProcedure
		.input(InsertCarFuelTypeSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newCarFuelType = await createCarFuelTypeService(db, input);
			return newCarFuelType;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedCarFuelType = await deleteCarFuelTypeService(db, input);
			return deletedCarFuelType;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const carFuelType = await getCarFuelTypeService(db, input);
			return carFuelType;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const carFuelTypes = await getCarFuelTypesService(db, input);
			return carFuelTypes;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarFuelTypeSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedCarFuelType = await updateCarFuelTypeService(
				db,
				input
			);
			return updatedCarFuelType;
		}),
});

