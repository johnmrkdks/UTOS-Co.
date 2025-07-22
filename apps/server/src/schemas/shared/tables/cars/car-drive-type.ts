import { carDriveTypes } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarDriveTypeSchema = createSelectSchema(carDriveTypes, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarDriveTypeSchema = createInsertSchema(carDriveTypes);
export const UpdateCarDriveTypeSchema = createUpdateSchema(carDriveTypes);

export type CarDriveType = z.infer<typeof CarDriveTypeSchema>;
export type InsertCarDriveType = z.infer<typeof InsertCarDriveTypeSchema>;
export type UpdateCarDriveType = z.infer<typeof UpdateCarDriveTypeSchema>;
