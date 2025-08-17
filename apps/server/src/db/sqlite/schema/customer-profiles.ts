import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const customerProfiles = sqliteTable("customer_profiles", {
	id: text("id").primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	
	// Contact Information
	phone: text("phone"),
	dateOfBirth: integer("date_of_birth", { mode: "timestamp" }),
	
	// Address Information
	address: text("address"),
	city: text("city"),
	state: text("state"),
	postalCode: text("postal_code"),
	country: text("country").default("Australia"),
	
	// Emergency Contact
	emergencyContactName: text("emergency_contact_name"),
	emergencyContactPhone: text("emergency_contact_phone"),
	emergencyContactRelationship: text("emergency_contact_relationship"),
	
	// Preferences
	preferredCarType: text("preferred_car_type"), // luxury, sedan, suv, etc.
	communicationPreferences: text("communication_preferences").default("email"), // email, sms, both
	
	// Profile Status
	profileCompleteness: integer("profile_completeness").default(0), // percentage 0-100
	isProfileComplete: integer("is_profile_complete", { mode: "boolean" }).default(false),
	
	// Timestamps
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});