import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { cars } from "./cars";
import { users } from "./users";

export const drivers = pgTable("drivers", {
	id: text("id").primaryKey(),
	userId: text("user_id").references(() => users.id),
	licenseNumber: text("license_number").notNull(),
	licenseExpiry: timestamp("license_expiry", { mode: "date" }).notNull(),

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
	dateOfBirth: timestamp("date_of_birth", { mode: "date" }),
	
	// Onboarding status
	onboardingStatus: text("onboarding_status").notNull().default("pending"), // pending, documents_uploaded, approved, rejected
	onboardingNotes: text("onboarding_notes"),
	approvedAt: timestamp("approved_at", { mode: "date" }),
	approvedBy: text("approved_by").references(() => users.id),

	// Availability
	carId: text("car_id").references(() => cars.id, { onDelete: "cascade" }),
	isActive: boolean("is_active").notNull().default(true),
	isApproved: boolean("is_approved").notNull().default(false),
	isAvailable: boolean("is_available").default(true),

	// Performance tracking
	rating: numeric("rating", { precision: 3, scale: 2 }).default("5.0"),
	totalRides: numeric("total_rides").default("0"),

	createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const driversRelations = relations(drivers, ({ one }) => ({
	user: one(users, { fields: [drivers.userId], references: [users.id] }),
	car: one(cars, { fields: [drivers.carId], references: [cars.id] }),
}));
