import type { DB } from "@/db";
import { pricingConfig } from "@/db/schema";
import { type UpdatePricingConfig, UpdatePricingConfigSchema } from "@/schemas/shared";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const UpdatePricingConfigServiceSchema = UpdatePricingConfigSchema.extend({
	id: z.string(),
});

export type UpdatePricingConfigParams = z.infer<typeof UpdatePricingConfigServiceSchema>;

export async function updatePricingConfigService(db: DB, data: UpdatePricingConfigParams) {
	const { id, ...updateData } = data;
	
	const [updatedConfig] = await db
		.update(pricingConfig)
		.set(updateData)
		.where(eq(pricingConfig.id, id))
		.returning();

	return updatedConfig;
}