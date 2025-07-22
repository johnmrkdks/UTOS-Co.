import { carFuelTypes } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarFuelTypeSchema = createSelectSchema(carFuelTypes, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarFuelTypeSchema = createInsertSchema(carFuelTypes);
export const UpdateCarFuelTypeSchema = createUpdateSchema(carFuelTypes);

export type CarFuelType = z.infer<typeof CarFuelTypeSchema>;
export type InsertCarFuelType = z.infer<typeof InsertCarFuelTypeSchema>;
export type UpdateCarFuelType = z.infer<typeof UpdateCarFuelTypeSchema>;
