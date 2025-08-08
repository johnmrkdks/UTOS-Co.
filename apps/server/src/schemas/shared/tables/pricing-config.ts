import { pricingConfig } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const PricingConfigSchema = createSelectSchema(pricingConfig, {
	createdAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
});
export const InsertPricingConfigSchema = createInsertSchema(pricingConfig);
export const UpdatePricingConfigSchema = createUpdateSchema(pricingConfig);

export type PricingConfig = z.infer<typeof PricingConfigSchema>;
export type InsertPricingConfig = z.infer<typeof InsertPricingConfigSchema>;
export type UpdatePricingConfig = z.infer<typeof UpdatePricingConfigSchema>;