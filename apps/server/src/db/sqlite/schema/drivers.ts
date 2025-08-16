import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cars } from "./cars";
import { users } from "./users";
import { createId } from "@paralleldrive/cuid2";

export const drivers = sqliteTable("drivers", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	userId: text("user_id").references(() => users.id),
	licenseNumber: text("license_number").notNull(),
	licenseExpiry: integer("license_expiry", { mode: "timestamp" }).notNull(),

	// Document uploads
	licenseDocumentUrl: text("license_document_url"),
	insuranceDocumentUrl: text("insurance_document_url"),
	backgroundCheckDocumentUrl: text("background_check_document_url"),
	profilePhotoUrl: text("profile_photo_url"),

	// Additional driver information
	phoneNumber: text("phone_number"),
	emergencyContactName: text("emergency_contact_name"),
	emergencyContactPhone: text("emergency_contact_phone"),
	address: text("address"),
	dateOfBirth: integer("date_of_birth", { mode: "timestamp" }),
	
	// Onboarding status
	onboardingStatus: text("onboarding_status").notNull().default("email_verification_pending"), // email_verification_pending, email_verified, documents_uploaded, approved, rejected
	onboardingNotes: text("onboarding_notes"),
	approvedAt: integer("approved_at", { mode: "timestamp" }),
	approvedBy: text("approved_by").references(() => users.id),
	
	// Email verification tracking
	emailVerificationSentAt: integer("email_verification_sent_at", { mode: "timestamp" }),
	emailVerifiedAt: integer("email_verified_at", { mode: "timestamp" }),
	onboardingEmailSentAt: integer("onboarding_email_sent_at", { mode: "timestamp" }),

	// Availability
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	isApproved: integer("is_approved", { mode: "boolean" })
		.notNull()
		.default(false),
	isAvailable: integer("is_available", { mode: "boolean" }).default(true),

	// Performance tracking
	rating: real("rating").default(5.0),
	totalRides: integer("total_rides").default(0),

	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const driversRelations = relations(drivers, ({ one }) => ({
	user: one(users, { fields: [drivers.userId], references: [users.id] }),
}));
