import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { packages } from "@/db/schema";

export const PackageSchema = createSelectSchema(packages, {
	createdAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
});
export const InsertPackageSchema = createInsertSchema(packages);
export const UpdatePackageSchema = createUpdateSchema(packages);

export type Package = z.infer<typeof PackageSchema>;
export type InsertPackage = z.infer<typeof InsertPackageSchema>;
export type UpdatePackage = z.infer<typeof UpdatePackageSchema>;
