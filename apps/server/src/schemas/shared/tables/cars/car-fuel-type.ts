import { carFuelTypes } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Base schemas
export const CarFuelTypeSchema = createSelectSchema(carFuelTypes, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarFuelTypeSchema = createInsertSchema(carFuelTypes);
export const UpdateCarFuelTypeSchema = createUpdateSchema(carFuelTypes);

// Extended schemas
export const CarFuelTypeWithEnrichedDataSchema = CarFuelTypeSchema.extend({
	metadata: z.object({
		carsCount: z.number(),
	}),
});

// Base types
export type CarFuelType = z.infer<typeof CarFuelTypeSchema>;
export type InsertCarFuelType = z.infer<typeof InsertCarFuelTypeSchema>;
export type UpdateCarFuelType = z.infer<typeof UpdateCarFuelTypeSchema>;

// Extended types
export type CarFuelTypeWithEnrichedData = z.infer<
	typeof CarFuelTypeWithEnrichedDataSchema
>;

