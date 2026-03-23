import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { carModels } from "@/db/schema";
import { CarBrandSchema } from "./car-brand";

// Base schemas
export const CarModelSchema = createSelectSchema(carModels, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarModelSchema = createInsertSchema(carModels).omit({
	id: true,
	createdAt: true,
});
export const UpdateCarModelSchema = createUpdateSchema(carModels).omit({
	createdAt: true,
});

// Extended schema
export const CarModelWithBrandSchema = CarModelSchema.extend({
	brand: CarBrandSchema,
});

export const CarModelWithEnrichedDataSchema = CarModelWithBrandSchema.extend({
	metadata: z.object({
		carsCount: z.number(),
	}),
});

// Base types
export type CarModel = z.infer<typeof CarModelSchema>;
export type InsertCarModel = z.infer<typeof InsertCarModelSchema>;
export type UpdateCarModel = z.infer<typeof UpdateCarModelSchema>;

// Extended types
export type CarModelWithBrand = z.infer<typeof CarModelWithBrandSchema>;
export type CarModelWithEnrichedData = z.infer<
	typeof CarModelWithEnrichedDataSchema
>;
