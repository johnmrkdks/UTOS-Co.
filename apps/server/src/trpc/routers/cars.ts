import { InsertCarSchema, UpdateCarSchema } from "@/schemas/shared/tables/car";
import { createCarService, CreateCarServiceSchema } from "@/services/cars/create-car";
import { deleteCarService, DeleteCarServiceSchema } from "@/services/cars/delete-car";
import { getCarService, GetCarServiceSchema } from "@/services/cars/get-car";
import { getCarsService } from "@/services/cars/get-cars";
import { updateCarService, UpdateCarServiceSchema } from "@/services/cars/update-car";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/query/resource-list";
import { z } from "zod";

export const carsRouter = router({
	create: protectedProcedure
		.input(CreateCarServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCar = await createCarService(db, input);
				return newCar;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCar = await deleteCarService(db, input);
				return deletedCar;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(GetCarServiceSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const car = await getCarService(db, input);
				return car;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const cars = await getCarsService(db, input);
				return cars;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(UpdateCarServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCar = await updateCarService(db, input);
				return updatedCar;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});
