import { carImages } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarImageSchema = createSelectSchema(carImages, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarImageSchema = createInsertSchema(carImages);
export const UpdateCarImageSchema = createUpdateSchema(carImages);

export type CarImage = z.infer<typeof CarImageSchema>;
export type InsertCarImage = z.infer<typeof InsertCarImageSchema>;
export type UpdateCarImage = z.infer<typeof UpdateCarImageSchema>;
