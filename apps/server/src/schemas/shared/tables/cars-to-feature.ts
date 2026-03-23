import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { carsToFeatures } from "@/db/sqlite/schema";

// Base schemas
export const CarsToFeatureSchema = createSelectSchema(carsToFeatures, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarsToFeatureSchema = createInsertSchema(carsToFeatures);
export const UpdateCarsToFeatureSchema = createUpdateSchema(carsToFeatures);

// Base types
export type CarsToFeature = z.infer<typeof CarsToFeatureSchema>;
export type InsertCarsToFeature = z.infer<typeof InsertCarsToFeatureSchema>;
export type UpdateCarsToFeature = z.infer<typeof UpdateCarsToFeatureSchema>;
