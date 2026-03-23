import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { carConditionTypes } from "@/db/schema";

// Base schemas
export const CarConditionTypeSchema = createSelectSchema(carConditionTypes, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarConditionTypeSchema =
	createInsertSchema(carConditionTypes);
export const UpdateCarConditionTypeSchema =
	createUpdateSchema(carConditionTypes);

// Extended schemas
export const CarConditionTypeWithEnrichedDataSchema =
	CarConditionTypeSchema.extend({
		metadata: z.object({
			carsCount: z.number(),
		}),
	});

// Base types
export type CarConditionType = z.infer<typeof CarConditionTypeSchema>;
export type InsertCarConditionType = z.infer<
	typeof InsertCarConditionTypeSchema
>;
export type UpdateCarConditionType = z.infer<
	typeof UpdateCarConditionTypeSchema
>;

// Extended types
export type CarConditionTypeWithEnrichedData = z.infer<
	typeof CarConditionTypeWithEnrichedDataSchema
>;
