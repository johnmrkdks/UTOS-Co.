import { carFeatures } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarFeatureSchema = createSelectSchema(carFeatures, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarFeatureSchema = createInsertSchema(carFeatures);
export const UpdateCarFeatureSchema = createUpdateSchema(carFeatures);

export type CarFeature = z.infer<typeof CarFeatureSchema>;
export type InsertCarFeature = z.infer<typeof InsertCarFeatureSchema>;
export type UpdateCarFeature = z.infer<typeof UpdateCarFeatureSchema>;
