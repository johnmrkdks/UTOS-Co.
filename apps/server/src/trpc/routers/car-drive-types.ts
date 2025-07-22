import {
	InsertCarDriveTypeSchema,
	UpdateCarDriveTypeSchema,
} from "@/schemas/shared/tables/cars/car-drive-type";
import { createCarDriveTypeService } from "@/services/cars-drive-types/create-car-drive-type";
import { deleteCarDriveTypeService } from "@/services/cars-drive-types/delete-car-drive-type";
import { getCarDriveTypeService } from "@/services/cars-drive-types/get-car-drive-type";
import { getCarDriveTypesService } from "@/services/cars-drive-types/get-car-drive-types";
import { updateCarDriveTypeService } from "@/services/cars-drive-types/update-car-drive-type";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carDriveTypesRouter = router({
	create: protectedProcedure
		.input(InsertCarDriveTypeSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarDriveType = await createCarDriveTypeService(db, input);
				return newCarDriveType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarDriveType = await deleteCarDriveTypeService(
					db,
					input.id,
				);
				return deletedCarDriveType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carDriveType = await getCarDriveTypeService(db, input.id);
				return carDriveType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carDriveTypes = await getCarDriveTypesService(db, input);
				return carDriveTypes;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarDriveTypeSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarDriveType = await updateCarDriveTypeService(db, input);
				return updatedCarDriveType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

