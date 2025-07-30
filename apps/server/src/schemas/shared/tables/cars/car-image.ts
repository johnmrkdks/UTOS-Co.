import { carImages } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Base schemas
export const CarImageSchema = createSelectSchema(carImages, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarImageSchema = createInsertSchema(carImages).omit({
	carId: true,
});
export const UpdateCarImageSchema = createUpdateSchema(carImages);

// Extended schemas
export const CarImageWithEnrichedDataSchema = CarImageSchema.extend({
	metadata: z.object({
		carsCount: z.number(),
	}),
});

// Base types
export type CarImage = z.infer<typeof CarImageSchema>;
export type InsertCarImage = z.infer<typeof InsertCarImageSchema>;
export type UpdateCarImage = z.infer<typeof UpdateCarImageSchema>;

// Extended types
export type CarImageWithEnrichedData = z.infer<
	typeof CarImageWithEnrichedDataSchema
>;

