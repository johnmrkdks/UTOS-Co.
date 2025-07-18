import { InsertCarSchema, UpdateCarSchema } from "@/schemas/shared/tables/car";
import { createCarService } from "@/services/cars/create-car";
import { deleteCarService } from "@/services/cars/delete-car";
import { getCarService } from "@/services/cars/get-car";
import { getCarsService } from "@/services/cars/get-cars";
import { updateCarService } from "@/services/cars/update-car";
import { protectedProcedure, router } from "@/trpc/init";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carsRouter = router({
	create: protectedProcedure
		.input(InsertCarSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newCar = await createCarService(db, input);
			return newCar;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedCar = await deleteCarService(db, input);
			return deletedCar;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const car = await getCarService(db, input);
			return car;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const cars = await getCarsService(db, input);
			return cars;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedCar = await updateCarService(db, input.id, input.data);
			return updatedCar;
		}),
});
