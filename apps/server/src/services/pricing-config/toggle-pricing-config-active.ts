import type { DB } from "@/db";
import { pricingConfig } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function togglePricingConfigActiveService(db: DB, configId: string) {
	// First, get the current config
	const currentConfig = await db
		.select()
		.from(pricingConfig)
		.where(eq(pricingConfig.id, configId))
		.limit(1);

	if (!currentConfig.length) {
		throw new Error("Pricing configuration not found");
	}

	const config = currentConfig[0];
	const newActiveStatus = !config.isActive;

	// If setting to active, ensure only one config is active
	if (newActiveStatus) {
		// First deactivate all other configs
		await db
			.update(pricingConfig)
			.set({ isActive: false })
			.where(eq(pricingConfig.isActive, true));
	} else {
		// If deactivating, check if there are other active configs
		const otherActiveConfigs = await db
			.select()
			.from(pricingConfig)
			.where(eq(pricingConfig.isActive, true));

		// If this is the only active config, prevent deactivation
		if (otherActiveConfigs.length === 1 && otherActiveConfigs[0].id === configId) {
			throw new Error("Cannot deactivate the only active pricing configuration. Please activate another configuration first.");
		}
	}

	// Update the target config
	const updatedConfig = await db
		.update(pricingConfig)
		.set({ 
			isActive: newActiveStatus,
		})
		.where(eq(pricingConfig.id, configId))
		.returning();

	return updatedConfig[0];
}