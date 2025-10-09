import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const systemSettings = sqliteTable("system_settings", {
	id: integer("id").primaryKey().$default(() => 1), // Single row table
	timezone: text("timezone").notNull().default("Australia/Sydney"), // System-wide timezone
	bookingReferencePrefix: text("booking_reference_prefix").notNull().default("DUC"), // Prefix for booking reference numbers (e.g., "DUC" for DUC-123456)
	createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});
