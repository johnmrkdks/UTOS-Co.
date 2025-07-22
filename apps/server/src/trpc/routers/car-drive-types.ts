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
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carDriveTypesRouter = router({
	create: protectedProcedure
		.input(InsertCarDriveTypeSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newCarDriveType = await createCarDriveTypeService(db, input);
			return newCarDriveType;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedCarDriveType = await deleteCarDriveTypeService(db, input);
			return deletedCarDriveType;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const carDriveType = await getCarDriveTypeService(db, input);
			return carDriveType;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const carDriveTypes = await getCarDriveTypesService(db, input);
			return carDriveTypes;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarDriveTypeSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedCarDriveType = await updateCarDriveTypeService(db, input);
			return updatedCarDriveType;
		}),
});

