import type { DB } from "@/db";
import { pricingConfig } from "@/db/schema";
import { type InsertPricingConfig, InsertPricingConfigSchema } from "@/schemas/shared";
import { z } from "zod";

export const CreatePricingConfigServiceSchema = InsertPricingConfigSchema.omit({ id: true });

export type CreatePricingConfigParams = z.infer<typeof CreatePricingConfigServiceSchema>;

export async function createPricingConfigService(db: DB, data: CreatePricingConfigParams) {
	const values = data as InsertPricingConfig;
	
	const [newConfig] = await db.insert(pricingConfig).values(values).returning();
	return newConfig;
}