import { z } from "zod";
import {
	createSelectSchema,
	createInsertSchema,
	createUpdateSchema,
} from "drizzle-zod"
import { carCategories } from "@/db/schema";

// Base schemas
export const CarCategorySchema = createSelectSchema(carCategories, {
	createdAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
});
export const InsertCarCategorySchema = createInsertSchema(carCategories);
export const UpdateCarCategorySchema = createUpdateSchema(carCategories);

// Extended schemas
export const CarCategoryWithEnrichedDataSchema = CarCategorySchema.extend({
	metadata: z.object({
		carsCount: z.number(),
	}),
});

// Base types
export type CarCategory = z.infer<typeof CarCategorySchema>;
export type InsertCarCategory = z.infer<typeof InsertCarCategorySchema>;
export type UpdateCarCategory = z.infer<typeof UpdateCarCategorySchema>;

// Extended types
export type CarCategoryWithEnrichedData = z.infer<
	typeof CarCategoryWithEnrichedDataSchema>
