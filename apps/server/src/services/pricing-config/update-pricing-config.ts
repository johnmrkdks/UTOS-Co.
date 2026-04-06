import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "@/db";
import { pricingConfig } from "@/db/schema";
import {
	type UpdatePricingConfig,
	UpdatePricingConfigSchema,
} from "@/schemas/shared";

export const UpdatePricingConfigServiceSchema =
	UpdatePricingConfigSchema.extend({
		id: z.string(),
	});

export type UpdatePricingConfigParams = z.infer<
	typeof UpdatePricingConfigServiceSchema
>;

export async function updatePricingConfigService(
	db: DB,
	data: UpdatePricingConfigParams,
) {
	const { id, hourlyRate, ...rest } = data;

	const [updatedConfig] = await db
		.update(pricingConfig)
		.set({
			...rest,
			...(hourlyRate !== undefined ? { hourlyRate: hourlyRate ?? null } : {}),
			updatedAt: sql`(unixepoch())`,
		})
		.where(eq(pricingConfig.id, id))
		.returning();

	return updatedConfig;
}
