import {
	InsertCarImageSchema,
	UpdateCarImageSchema,
} from "@/schemas/shared/tables/cars/car-image";
import { createCarImageService } from "@/services/cars-images/create-car-image";
import { deleteCarImageService } from "@/services/cars-images/delete-car-image";
import { getCarImageService } from "@/services/cars-images/get-car-image";
import { getCarImagesService } from "@/services/cars-images/get-car-images";
import { updateCarImageService } from "@/services/cars-images/update-car-image";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carImagesRouter = router({
	create: protectedProcedure
		.input(InsertCarImageSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarImage = await createCarImageService(db, input);
				return newCarImage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarImage = await deleteCarImageService(db, input.id);
				return deletedCarImage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carImage = await getCarImageService(db, input.id);
				return carImage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			try {
				const carImages = await getCarImagesService(db, input);
				return carImages;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarImageSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarImage = await updateCarImageService(
					db,
					input,
				);
				return updatedCarImage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

