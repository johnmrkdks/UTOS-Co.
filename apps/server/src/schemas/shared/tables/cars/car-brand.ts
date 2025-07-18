import { carBrands } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarBrandSchema = createSelectSchema(carBrands);
export const InsertCarBrandSchema = createInsertSchema(carBrands);
export const UpdateCarBrandSchema = createUpdateSchema(carBrands);

export type CarBrand = z.infer<typeof CarBrandSchema>;
export type InsertCarBrand = z.infer<typeof InsertCarBrandSchema>;
export type UpdateCarBrand = z.infer<typeof UpdateCarBrandSchema>;

