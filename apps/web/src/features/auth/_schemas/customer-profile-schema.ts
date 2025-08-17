import { z } from "zod";

export const customerProfileSchema = z.object({
	// Personal Information (read-only, from user table)
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	
	// Customer profile fields
	phone: z.string().optional(),
	dateOfBirth: z.date().optional(),
	
	// Address Information
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postalCode: z.string().optional(),
	country: z.string().optional(),
	
	// Emergency Contact
	emergencyContactName: z.string().optional(),
	emergencyContactPhone: z.string().optional(),
	emergencyContactRelationship: z.string().optional(),
	
	// Preferences
	preferredCarType: z.string().optional(),
	communicationPreferences: z.enum(["email", "sms", "both"]).optional(),
});

export const updateCustomerProfileSchema = customerProfileSchema.partial();

export type CustomerProfile = z.infer<typeof customerProfileSchema>;
export type UpdateCustomerProfile = z.infer<typeof updateCustomerProfileSchema>;