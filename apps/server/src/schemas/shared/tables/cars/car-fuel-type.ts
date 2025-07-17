import { carFuelTypes } from "@/db/sqlite/schema/cars/car-fuel-types";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarFuelTypeSchema = createSelectSchema(carFuelTypes);
export const InsertCarFuelTypeSchema = createInsertSchema(carFuelTypes);
export const UpdateCarFuelTypeSchema = createUpdateSchema(carFuelTypes);

export type CarFuelType = z.infer<typeof CarFuelTypeSchema>;
export type InsertCarFuelType = z.infer<typeof InsertCarFuelTypeSchema>;
export type UpdateCarFuelType = z.infer<typeof UpdateCarFuelTypeSchema>;
