import { carBodyTypes } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarBodyTypeSchema = createSelectSchema(carBodyTypes, {
	createdAt: z.union([z.date(), z.string()]),
});
export const InsertCarBodyTypeSchema = createInsertSchema(carBodyTypes);
export const UpdateCarBodyTypeSchema = createUpdateSchema(carBodyTypes);

export type CarBodyType = z.infer<typeof CarBodyTypeSchema>;
export type InsertCarBodyType = z.infer<typeof InsertCarBodyTypeSchema>;
export type UpdateCarBodyType = z.infer<typeof UpdateCarBodyTypeSchema>;
