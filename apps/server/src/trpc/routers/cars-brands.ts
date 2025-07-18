import {
	InsertCarBrandSchema,
	UpdateCarBrandSchema,
} from "@/schemas/shared/tables/cars/car-brand";
import { createCarBrandService } from "@/services/cars-brands/create-car-brand";
import { deleteCarBrandService } from "@/services/cars-brands/delete-car-brand";
import { getCarBrandService } from "@/services/cars-brands/get-car-brand";
import { getCarBrandsService } from "@/services/cars-brands/get-car-brands";
import { updateCarBrandService } from "@/services/cars-brands/update-car-brand";
import { protectedProcedure, router } from "@/trpc/init";
import { ResourceListSchema } from "@/utils/resource-list-schema";
import { z } from "zod";

export const carsBrandsRouter = router({
	create: protectedProcedure
		.input(InsertCarBrandSchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const newCarBrand = await createCarBrandService(db, input);
			return newCarBrand;
		}),
	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input }) => {
			const deletedCarBrand = await deleteCarBrandService(db, input);
			return deletedCarBrand;
		}),
	get: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input }) => {
			const carBrand = await getCarBrandService(db, input);
			return carBrand;
		}),
	list: protectedProcedure
		.input(ResourceListSchema)
		.query(async ({ ctx: { db }, input }) => {
			const carBrands = await getCarBrandsService(db, input);
			return carBrands;
		}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: UpdateCarBrandSchema }))
		.mutation(async ({ ctx: { db }, input }) => {
			const updatedCarBrand = await updateCarBrandService(
				db,
				input.id,
				input.data,
			);
			return updatedCarBrand;
		}),
});

