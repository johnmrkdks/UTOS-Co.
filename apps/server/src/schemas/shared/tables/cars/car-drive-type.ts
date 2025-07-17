import { carDriveTypes } from "@/db/sqlite/schema/cars/car-drive-types";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarDriveTypeSchema = createSelectSchema(carDriveTypes);
export const InsertCarDriveTypeSchema = createInsertSchema(carDriveTypes);
export const UpdateCarDriveTypeSchema = createUpdateSchema(carDriveTypes);

export type CarDriveType = z.infer<typeof CarDriveTypeSchema>;
export type InsertCarDriveType = z.infer<typeof InsertCarDriveTypeSchema>;
export type UpdateCarDriveType = z.infer<typeof UpdateCarDriveTypeSchema>;
