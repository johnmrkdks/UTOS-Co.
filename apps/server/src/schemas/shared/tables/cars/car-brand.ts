import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { carBrands } from "@/db/schema";
import { CarModelSchema } from "./car-model";

// Base schemas
export const CarBrandSchema = createSelectSchema(carBrands, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarBrandSchema = createInsertSchema(carBrands);
export const UpdateCarBrandSchema = createUpdateSchema(carBrands);

// Extended schemas
export const CarBrandWithModelsSchema = CarBrandSchema.extend({
	models: z.array(CarModelSchema),
});

export const CarBrandWithEnrichedDataSchema = CarBrandSchema.extend({
	metadata: z.object({
		modelCount: z.number(),
		carsCount: z.number(),
	}),
});

// Base types
export type CarBrand = z.infer<typeof CarBrandSchema>;
export type InsertCarBrand = z.infer<typeof InsertCarBrandSchema>;
export type UpdateCarBrand = z.infer<typeof UpdateCarBrandSchema>;

// Extended types
export type CarBrandWithModels = z.infer<typeof CarBrandWithModelsSchema>;
export type CarBrandWithEnrichedData = z.infer<
	typeof CarBrandWithEnrichedDataSchema
>;
