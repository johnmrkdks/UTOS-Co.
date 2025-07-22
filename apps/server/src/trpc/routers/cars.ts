import { InsertCarSchema, UpdateCarSchema } from "@/schemas/shared/tables/car";
import { createCarService } from "@/services/cars/create-car";
import { deleteCarService } from "@/services/cars/delete-car";
import { getCarService } from "@/services/cars/get-car";
import { getCarsService } from "@/services/cars/get-cars";
import { updateCarService } from "@/services/cars/update-car";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carsRouter = router({
	create: protectedProcedure
		.input(InsertCarSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCar = await createCarService(db, input);
				return newCar;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCar = await deleteCarService(db, input.id);
				return deletedCar;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const car = await getCarService(db, input.id);
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
		.input(z.object({ id: z.string(), data: UpdateCarSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCar = await updateCarService(db, input);
				return updatedCar;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});
