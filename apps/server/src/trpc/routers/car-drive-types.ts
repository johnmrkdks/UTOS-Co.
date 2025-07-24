import {
	CreateCarDriveTypeServiceSchema,
	createCarDriveTypeService,
} from "@/services/cars-drive-types/create-car-drive-type";
import {
	DeleteCarDriveTypeServiceSchema,
	deleteCarDriveTypeService,
} from "@/services/cars-drive-types/delete-car-drive-type";
import {
	GetCarDriveTypeServiceSchema,
	getCarDriveTypeService,
} from "@/services/cars-drive-types/get-car-drive-type";
import { getCarDriveTypesService } from "@/services/cars-drive-types/get-car-drive-types";
import { getCarDriveTypesWithEnrichedDataService } from "@/services/cars-drive-types/get-car-drive-types-with-enriched-data";
import {
	UpdateCarDriveTypeServiceSchema,
	updateCarDriveTypeService,
} from "@/services/cars-drive-types/update-car-drive-type";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const carDriveTypesRouter = router({
	create: protectedProcedure
		.input(CreateCarDriveTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarDriveType = await createCarDriveTypeService(db, input);
				return newCarDriveType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarDriveTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarDriveType = await deleteCarDriveTypeService(db, input);
				return deletedCarDriveType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetCarDriveTypeServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carDriveType = await getCarDriveTypeService(db, input);
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
	listWithEnrichedData: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carDriveTypes = await getCarDriveTypesWithEnrichedDataService(db, input);
				return carDriveTypes;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateCarDriveTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarDriveType = await updateCarDriveTypeService(db, input);
				return updatedCarDriveType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

