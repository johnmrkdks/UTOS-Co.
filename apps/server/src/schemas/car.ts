import { cars } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarSchema = createSelectSchema(cars);
export const InsertCarSchema = createInsertSchema(cars);
export const UpdateCarSchema = createUpdateSchema(cars);

export type Car = z.infer<typeof CarSchema>;
export type InsertCar = z.infer<typeof InsertCarSchema>;
export type UpdateCar = z.infer<typeof UpdateCarSchema>;
