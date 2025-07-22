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
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carImagesRouter = router({
	create: protectedProcedure
		.input(InsertCarImageSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newCarImage = await createCarImageService(db, input);
			return newCarImage;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedCarImage = await deleteCarImageService(db, input);
			return deletedCarImage;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const carImage = await getCarImageService(db, input);
			return carImage;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const carImages = await getCarImagesService(db, input);
			return carImages;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarImageSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedCarImage = await updateCarImageService(
				db,
				input,
			);
			return updatedCarImage;
		}),
});

