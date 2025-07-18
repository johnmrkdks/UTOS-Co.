import { packages } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const PackageSchema = createSelectSchema(packages);
export const InsertPackageSchema = createInsertSchema(packages);
export const UpdatePackageSchema = createUpdateSchema(packages);

export type Package = z.infer<typeof PackageSchema>;
export type InsertPackage = z.infer<typeof InsertPackageSchema>;
export type UpdatePackage = z.infer<typeof UpdatePackageSchema>;
