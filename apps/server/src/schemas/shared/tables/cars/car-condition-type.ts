import { carConditionTypes } from "@/db/sqlite/schema/cars/car-condition-types";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarConditionTypeSchema = createSelectSchema(carConditionTypes);
export const InsertCarConditionTypeSchema =
	createInsertSchema(carConditionTypes);
export const UpdateCarConditionTypeSchema =
	createUpdateSchema(carConditionTypes);

export type CarConditionType = z.infer<typeof CarConditionTypeSchema>;
export type InsertCarConditionType = z.infer<
	typeof InsertCarConditionTypeSchema
>;
export type UpdateCarConditionType = z.infer<
	typeof UpdateCarConditionTypeSchema
>;
