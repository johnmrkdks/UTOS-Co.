import { carDriveTypes } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Base schemas
export const CarDriveTypeSchema = createSelectSchema(carDriveTypes, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarDriveTypeSchema = createInsertSchema(carDriveTypes);
export const UpdateCarDriveTypeSchema = createUpdateSchema(carDriveTypes);

// Extended schemas
export const CarDriveTypeWithEnrichedDataSchema = CarDriveTypeSchema.extend({
	metadata: z.object({
		carsCount: z.number(),
	}),
});

// Base types
export type CarDriveType = z.infer<typeof CarDriveTypeSchema>;
export type InsertCarDriveType = z.infer<typeof InsertCarDriveTypeSchema>;
export type UpdateCarDriveType = z.infer<typeof UpdateCarDriveTypeSchema>;

// Extended types
export type CarDriveTypeWithEnrichedData = z.infer<
	typeof CarDriveTypeWithEnrichedDataSchema
>;
