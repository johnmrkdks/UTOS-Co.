import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";

export const bookingPolicies = sqliteTable("booking_policies", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	
	// Policy name and description
	name: text("name").notNull(),
	description: text("description"),
	
	// Edit policy settings (in hours before pickup)
	editAllowedHours: integer("edit_allowed_hours").notNull().default(4),
	editDisabledAfterDriverAssignment: integer("edit_disabled_after_driver_assignment", { mode: "boolean" }).notNull().default(true),
	
	// Cancellation policy settings (in hours before pickup)  
	cancellationAllowedHours: integer("cancellation_allowed_hours").notNull().default(4),
	cancellationFeePercentage: integer("cancellation_fee_percentage").notNull().default(0), // 0-100
	cancellationDisabledAfterDriverAssignment: integer("cancellation_disabled_after_driver_assignment", { mode: "boolean" }).notNull().default(false),
	
	// General policy settings
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
	
	createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});