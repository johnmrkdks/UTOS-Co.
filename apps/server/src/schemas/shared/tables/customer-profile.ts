import { customerProfiles } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const CustomerProfileSchema = createSelectSchema(customerProfiles, {
	dateOfBirth: z.union([z.date(), z.string()]).nullable(),
	createdAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
});

export const InsertCustomerProfileSchema = createInsertSchema(customerProfiles, {
	dateOfBirth: z.union([z.date(), z.string()]).optional(),
});

export const UpdateCustomerProfileSchema = createUpdateSchema(customerProfiles, {
	dateOfBirth: z.union([z.date(), z.string()]).optional(),
}).omit({ 
	id: true, 
	userId: true, 
	createdAt: true,
	updatedAt: true 
});

export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;
export type InsertCustomerProfile = z.infer<typeof InsertCustomerProfileSchema>;
export type UpdateCustomerProfile = z.infer<typeof UpdateCustomerProfileSchema>;