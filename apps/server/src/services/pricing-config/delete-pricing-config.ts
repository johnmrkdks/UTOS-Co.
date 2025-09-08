import type { DB } from "@/db";
import { pricingConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const DeletePricingConfigServiceSchema = z.object({
	id: z.string(),
});

export type DeletePricingConfigParams = z.infer<typeof DeletePricingConfigServiceSchema>;

export async function deletePricingConfigService(db: DB, { id }: DeletePricingConfigParams) {
	// First check if the pricing config exists
	const existingConfig = await db
		.select()
		.from(pricingConfig)
		.where(eq(pricingConfig.id, id))
		.limit(1);

	if (!existingConfig.length) {
		throw new Error("Pricing configuration not found");
	}

	// Delete the pricing configuration
	const deletedConfig = await db
		.delete(pricingConfig)
		.where(eq(pricingConfig.id, id))
		.returning();

	return deletedConfig[0];
}