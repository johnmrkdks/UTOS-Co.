import {
	CreateCarBodyTypeServiceSchema,
	createCarBodyTypeService,
} from "@/services/cars-body-types/create-car-body-type";
import {
	DeleteCarBodyTypeServiceSchema,
	deleteCarBodyTypeService,
} from "@/services/cars-body-types/delete-car-body-type";
import {
	GetCarBodyTypeServiceSchema,
	getCarBodyTypeService,
} from "@/services/cars-body-types/get-car-body-type";
import { getCarBodyTypesService } from "@/services/cars-body-types/get-car-body-types";
import { getCarBodyTypesWithEnrichedDataService } from "@/services/cars-body-types/get-car-body-types-with-enriched-data";
import {
	UpdateCarBodyTypeServiceSchema,
	updateCarBodyTypeService,
} from "@/services/cars-body-types/update-car-body-type";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const carBodyTypesRouter = router({
	create: protectedProcedure
		.input(CreateCarBodyTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarBodyType = await createCarBodyTypeService(db, input);
				return newCarBodyType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarBodyTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarBodyType = await deleteCarBodyTypeService(db, input);
				return deletedCarBodyType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetCarBodyTypeServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carBodyType = await getCarBodyTypeService(db, input);
				return carBodyType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carBodyTypes = await getCarBodyTypesService(db, input);
				return carBodyTypes;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	listWithEnrichedData: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carBodyTypes = await getCarBodyTypesWithEnrichedDataService(db, input);
				return carBodyTypes;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateCarBodyTypeServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarBodyType = await updateCarBodyTypeService(db, input);
				return updatedCarBodyType;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

