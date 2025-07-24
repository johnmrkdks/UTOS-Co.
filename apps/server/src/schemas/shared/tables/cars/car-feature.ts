import { carFeatures } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Base schemas
export const CarFeatureSchema = createSelectSchema(carFeatures, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarFeatureSchema = createInsertSchema(carFeatures);
export const UpdateCarFeatureSchema = createUpdateSchema(carFeatures);

// Extended schemas
export const CarFeatureWithEnrichedDataSchema = CarFeatureSchema.extend({
	metadata: z.object({
		carsCount: z.number(),
	}),
});

// Base types
export type CarFeature = z.infer<typeof CarFeatureSchema>;
export type InsertCarFeature = z.infer<typeof InsertCarFeatureSchema>;
export type UpdateCarFeature = z.infer<typeof UpdateCarFeatureSchema>;

// Extended types
export type CarFeatureWithEnrichedData = z.infer<
	typeof CarFeatureWithEnrichedDataSchema
>;
