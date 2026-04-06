import type { z } from "zod";
import type { DB } from "@/db";
import { pricingConfig } from "@/db/schema";
import {
	type InsertPricingConfig,
	InsertPricingConfigSchema,
} from "@/schemas/shared";

export const CreatePricingConfigServiceSchema = InsertPricingConfigSchema.omit({
	id: true,
});

export type CreatePricingConfigParams = z.infer<
	typeof CreatePricingConfigServiceSchema
>;

export async function createPricingConfigService(
	db: DB,
	data: CreatePricingConfigParams,
) {
	const values = data as InsertPricingConfig;

	const [newConfig] = await db
		.insert(pricingConfig)
		.values({
			...values,
			hourlyRate: values.hourlyRate ?? null,
		})
		.returning();
	return newConfig;
}
