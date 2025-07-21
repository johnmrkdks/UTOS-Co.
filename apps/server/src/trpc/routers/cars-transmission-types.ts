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
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carsTransmissionTypesRouter = router({
	create: protectedProcedure
		.input(InsertCarTransmissionTypeSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newCarTransmissionType = await createCarTransmissionTypeService(
				db,
				input,
			);
			return newCarTransmissionType;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedCarTransmissionType = await deleteCarTransmissionTypeService(
				db,
				input,
			);
			return deletedCarTransmissionType;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const carTransmissionType = await getCarTransmissionTypeService(
				db,
				input,
			);
			return carTransmissionType;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const carTransmissionTypes = await getCarTransmissionTypesService(
				db,
				input,
			);
			return carTransmissionTypes;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarTransmissionTypeSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedCarTransmissionType = await updateCarTransmissionTypeService(
				db,
				input,
			);
			return updatedCarTransmissionType;
		}),
});

