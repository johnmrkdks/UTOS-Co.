import { carModels } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarModelSchema = createSelectSchema(carModels);
export const InsertCarModelSchema = createInsertSchema(carModels);
export const UpdateCarModelSchema = createUpdateSchema(carModels);

export type CarModel = z.infer<typeof CarModelSchema>;
export type InsertCarModel = z.infer<typeof InsertCarModelSchema>;
export type UpdateCarModel = z.infer<typeof UpdateCarModelSchema>;
