import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";
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