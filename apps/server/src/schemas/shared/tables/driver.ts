import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { drivers } from "@/db/sqlite/schema";

export const DriverSchema = createSelectSchema(drivers, {
	createdAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
});
export const InsertDriverSchema = createInsertSchema(drivers);
export const UpdateDriverSchema = createUpdateSchema(drivers);

export type Driver = z.infer<typeof DriverSchema>;
export type InsertDriver = z.infer<typeof InsertDriverSchema>;
export type UpdateDriver = z.infer<typeof UpdateDriverSchema>;
