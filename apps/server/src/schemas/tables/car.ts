import { cars } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { CarFeatureSchema } from "./car-feature";
import { CarImageSchema } from "./car-image";

export const CarSchema = createSelectSchema(cars).extend({
	features: z.array(CarFeatureSchema),
	images: z.array(CarImageSchema),
});
export const InsertCarSchema = createInsertSchema(cars).extend({});
export const UpdateCarSchema = createUpdateSchema(cars);

export type Car = z.infer<typeof CarSchema>;
export type InsertCar = z.infer<typeof InsertCarSchema>;
export type UpdateCar = z.infer<typeof UpdateCarSchema>;
