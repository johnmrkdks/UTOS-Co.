import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { carImages } from "@/db/sqlite/schema/cars/car-images";
import { carFeatures } from "@/db/sqlite/schema/cars/car-features";
import { carModels } from "@/db/sqlite/schema/cars/car-models";
import { bodyTypes } from "@/db/sqlite/schema/cars/car-body-types";
import { fuelTypes } from "@/db/sqlite/schema/cars/car-fuel-types";
import { transmissionTypes } from "@/db/sqlite/schema/cars/car-transmission-types";
import { driveTypes } from "@/db/sqlite/schema/cars/car-drive-types";
import { conditionTypes } from "@/db/sqlite/schema/cars/car-condition-types";

export const cars = sqliteTable(
	"cars",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		description: text("description").notNull(),
		dateManufactured: integer("date_manufactured", {
			mode: "timestamp",
		}).notNull(),

		// Foreign keys to normalized tables
		modelId: text("model_id")
			.notNull()
			.references(() => carModels.id, { onDelete: "restrict" }),
		bodyTypeId: text("body_type_id")
			.notNull()
			.references(() => bodyTypes.id, { onDelete: "restrict" }),
		fuelTypeId: text("fuel_type_id")
			.notNull()
			.references(() => fuelTypes.id, { onDelete: "restrict" }),
		transmissionTypeId: text("transmission_type_id")
			.notNull()
			.references(() => transmissionTypes.id, { onDelete: "restrict" }),
		driveTypeId: text("drive_type_id")
			.notNull()
			.references(() => driveTypes.id, { onDelete: "restrict" }),
		conditionTypeId: text("condition_type_id")
			.notNull()
			.references(() => conditionTypes.id, { onDelete: "restrict" }),

		// Car-specific attributes
		mileage: integer("mileage").notNull(),
		color: text("color").notNull(),
		engineSize: integer("engine_size").notNull(), // in CC
		doors: integer("doors").notNull(),
		cylinders: integer("cylinders").notNull(),

		// Pricing
		pricePerDay: integer("price_per_day"), // in cents
		pricePerKm: integer("price_per_km"), // in cents

		// Availability flags
		isForDelivery: integer("is_for_delivery", { mode: "boolean" })
			.notNull()
			.default(false),
		isAvailable: integer("is_available", { mode: "boolean" })
			.notNull()
			.default(false),
		isForHire: integer("is_for_hire", { mode: "boolean" })
			.notNull()
			.default(false),
		isForRent: integer("is_for_rent", { mode: "boolean" })
			.notNull()
			.default(false),

		// Timestamps
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => ({
		modelIdx: index("cars_model_idx").on(table.modelId),
		availabilityIdx: index("cars_availability_idx").on(table.isAvailable),
		priceIdx: index("cars_price_idx").on(table.pricePerDay),
	}),
);

export const carsRelations = relations(cars, ({ one, many }) => ({
	model: one(carModels, {
		fields: [cars.modelId],
		references: [carModels.id],
	}),
	bodyType: one(bodyTypes, {
		fields: [cars.bodyTypeId],
		references: [bodyTypes.id],
	}),
	fuelType: one(fuelTypes, {
		fields: [cars.fuelTypeId],
		references: [fuelTypes.id],
	}),
	transmissionType: one(transmissionTypes, {
		fields: [cars.transmissionTypeId],
		references: [transmissionTypes.id],
	}),
	driveType: one(driveTypes, {
		fields: [cars.driveTypeId],
		references: [driveTypes.id],
	}),
	conditionType: one(conditionTypes, {
		fields: [cars.conditionTypeId],
		references: [conditionTypes.id],
	}),
	images: many(carImages),
	features: many(carFeatures),
}));
