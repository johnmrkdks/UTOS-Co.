import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text, real, index } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { cars } from "./cars";

export const instantQuotes = sqliteTable(
	"instant_quotes",
	{
		id: text("id").primaryKey().$defaultFn(() => createId()),
		
		// Route information
		originAddress: text("origin_address").notNull(),
		destinationAddress: text("destination_address").notNull(),
		originLatitude: real("origin_latitude"),
		originLongitude: real("origin_longitude"),
		destinationLatitude: real("destination_latitude"),
		destinationLongitude: real("destination_longitude"),
		
		// Stops data as JSON
		stops: text("stops", { mode: "json" }),
		
		// Selected car information
		carId: text("car_id").references(() => cars.id),
		
		// Flexible quote calculations
		firstKmFare: real("first_km_fare").notNull(),
		additionalKmFare: real("additional_km_fare").notNull(),
		totalAmount: real("total_amount").notNull(),
		
		// Trip metrics
		estimatedDistance: integer("estimated_distance").notNull(), // in meters
		estimatedDuration: integer("estimated_duration").notNull(), // in seconds
		
		// Pricing breakdown as JSON for transparency
		breakdown: text("breakdown", { mode: "json" }),
		
		// Quote metadata
		scheduledPickupTime: integer("scheduled_pickup_time", { mode: "timestamp" }),
		
		// Expiry and security
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(), // Quotes expire after 30 minutes
		
		// Optional: track IP for security/analytics
		clientIp: text("client_ip"),
		userAgent: text("user_agent"),
		
		// Timestamps
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(table) => ({
		expiresAtIdx: index("instant_quotes_expires_at_idx").on(table.expiresAt),
		carIdIdx: index("instant_quotes_car_id_idx").on(table.carId),
		createdAtIdx: index("instant_quotes_created_at_idx").on(table.createdAt),
		clientIpIdx: index("instant_quotes_client_ip_idx").on(table.clientIp),
	}),
);

export const instantQuotesRelations = relations(instantQuotes, ({ one }) => ({
	car: one(cars, {
		fields: [instantQuotes.carId],
		references: [cars.id],
	}),
}));