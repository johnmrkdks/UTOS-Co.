import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";
import { packageCategories } from "@/db/schema";

export const PackageCategorySchema = createSelectSchema(packageCategories);
export const InsertPackageCategorySchema =
	createInsertSchema(packageCategories);
export const UpdatePackageCategorySchema =
	createUpdateSchema(packageCategories);

export type PackageCategory = z.infer<typeof PackageCategorySchema>;
export type InsertPackageCategory = z.infer<typeof InsertPackageCategorySchema>;
export type UpdatePackageCategory = z.infer<typeof UpdatePackageCategorySchema>;
