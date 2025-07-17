import { carBodyTypes } from "@/db/sqlite/schema/cars/car-body-types";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarBodyTypeSchema = createSelectSchema(carBodyTypes);
export const InsertCarBodyTypeSchema = createInsertSchema(carBodyTypes);
export const UpdateCarBodyTypeSchema = createUpdateSchema(carBodyTypes);

export type CarBodyType = z.infer<typeof CarBodyTypeSchema>;
export type InsertCarBodyType = z.infer<typeof InsertCarBodyTypeSchema>;
export type UpdateCarBodyType = z.infer<typeof UpdateCarBodyTypeSchema>;
