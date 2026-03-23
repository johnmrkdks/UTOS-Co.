import { offloadBookingDetails } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const OffloadBookingDetailsSchema = createSelectSchema(offloadBookingDetails, {
	createdAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
});

export const InsertOffloadBookingDetailsSchema = createInsertSchema(offloadBookingDetails);

export const UpdateOffloadBookingDetailsSchema = createUpdateSchema(offloadBookingDetails).partial();

export type OffloadBookingDetails = z.infer<typeof OffloadBookingDetailsSchema>;
export type InsertOffloadBookingDetails = z.infer<typeof InsertOffloadBookingDetailsSchema>;
export type UpdateOffloadBookingDetails = z.infer<typeof UpdateOffloadBookingDetailsSchema>;
