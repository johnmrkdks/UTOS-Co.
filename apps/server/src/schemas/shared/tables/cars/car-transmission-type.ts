import { carTransmissionTypes } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CarTransmissionTypeSchema =
	createSelectSchema(carTransmissionTypes, {
		createdAt: z.union([z.date(), z.string()]),
	});
export const InsertCarTransmissionTypeSchema =
	createInsertSchema(carTransmissionTypes);
export const UpdateCarTransmissionTypeSchema =
	createUpdateSchema(carTransmissionTypes);

export type CarTransmissionType = z.infer<typeof CarTransmissionTypeSchema>;
export type InsertCarTransmissionType = z.infer<
	typeof InsertCarTransmissionTypeSchema
>;
export type UpdateCarTransmissionType = z.infer<
	typeof UpdateCarTransmissionTypeSchema
>;
