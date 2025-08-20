import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { packageServiceTypes } from "@/db/sqlite/schema";

export const SelectPackageServiceTypeSchema = createSelectSchema(packageServiceTypes);
export const InsertPackageServiceTypeSchema = createInsertSchema(packageServiceTypes, {
	name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
	description: z.string().optional(),
	icon: z.string().optional(),
	isActive: z.boolean().optional(),
	displayOrder: z.number().int().min(0).optional(),
});
export const UpdatePackageServiceTypeSchema = InsertPackageServiceTypeSchema.partial().extend({
	id: z.string().min(1, "ID is required"),
});

export type SelectPackageServiceType = z.infer<typeof SelectPackageServiceTypeSchema>;
export type InsertPackageServiceType = z.infer<typeof InsertPackageServiceTypeSchema>;
export type UpdatePackageServiceType = z.infer<typeof UpdatePackageServiceTypeSchema>;