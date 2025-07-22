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
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carFuelTypesRouter = router({
	create: protectedProcedure
		.input(InsertCarFuelTypeSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarFuelType = await createCarFuelTypeService(db, input);
				return newCarFuelType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarFuelType = await deleteCarFuelTypeService(
					db,
					input.id,
				);
				return deletedCarFuelType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carFuelType = await getCarFuelTypeService(db, input.id);
				return carFuelType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carFuelTypes = await getCarFuelTypesService(db, input);
				return carFuelTypes;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarFuelTypeSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarFuelType = await updateCarFuelTypeService(
					db,
					input,
				);
				return updatedCarFuelType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

