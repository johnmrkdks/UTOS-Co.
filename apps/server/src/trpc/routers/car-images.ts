import {
	CreateCarImageServiceSchema,
	createCarImageService,
} from "@/services/cars-images/create-car-image";
import {
	DeleteCarImageServiceSchema,
	deleteCarImageService,
} from "@/services/cars-images/delete-car-image";
import { GetCarImageServiceSchema, getCarImageService } from "@/services/cars-images/get-car-image";
import { getCarImagesService } from "@/services/cars-images/get-car-images";
import {
	UpdateCarImageServiceSchema,
	updateCarImageService,
} from "@/services/cars-images/update-car-image";
import { protectedProcedure, router } from "@/trpc/init";
import { handleTRPCError } from "@/trpc/utils/error-handler";
import { ResourceListSchema } from "@/utils/resource-list-schema";

export const carImagesRouter = router({
	create: protectedProcedure
		.input(CreateCarImageServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const newCarImage = await createCarImageService(db, input);
				return newCarImage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	delete: protectedProcedure
		.input(DeleteCarImageServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const deletedCarImage = await deleteCarImageService(db, input);
				return deletedCarImage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
	get: protectedProcedure.input(GetCarImageServiceSchema).query(async ({ ctx: { db }, input }) => {
		try {
			const carImage = await getCarImageService(db, input);
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
		.input(UpdateCarImageServiceSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			try {
				const updatedCarImage = await updateCarImageService(db, input);
				return updatedCarImage;
			} catch (error) {
				handleTRPCError(error);
			}
		}),
});

