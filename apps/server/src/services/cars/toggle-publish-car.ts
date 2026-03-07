import type { DB } from "@/db";
import { cars, pricingConfig } from "@/db/schema";
import { eq, or, isNull } from "drizzle-orm";
import { z } from "zod";

export const TogglePublishCarServiceSchema = z.object({
	id: z.string(),
	isPublished: z.boolean(),
});

export type TogglePublishCarService = z.infer<typeof TogglePublishCarServiceSchema>;

export async function togglePublishCarService(
	db: DB,
	{ id, isPublished }: TogglePublishCarService,
) {
	// If trying to publish (isPublished = true), check for pricing config (car-specific or global)
	if (isPublished) {
		const existingPricingConfig = await db
			.select()
			.from(pricingConfig)
			.where(or(eq(pricingConfig.carId, id), isNull(pricingConfig.carId)))
			.limit(1);

		if (existingPricingConfig.length === 0) {
			throw new Error("Cannot publish car: Pricing configuration is required before publishing a vehicle. Please create a pricing configuration for this car first.");
		}
	}

	const [updatedCar] = await db
		.update(cars)
		.set({ 
			isPublished,
			updatedAt: new Date(),
		})
		.where(eq(cars.id, id))
		.returning();

	if (!updatedCar) {
		throw new Error("Car not found");
	}

	return updatedCar;
}