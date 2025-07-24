import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { carImages } from "@/db/sqlite/schema/cars/car-images";
import { carFeatures } from "@/db/sqlite/schema/cars/car-features";
import { carModels } from "@/db/sqlite/schema/cars/car-models";
import { carBodyTypes } from "@/db/sqlite/schema/cars/car-body-types";
import { carFuelTypes } from "@/db/sqlite/schema/cars/car-fuel-types";
import { carTransmissionTypes } from "@/db/sqlite/schema/cars/car-transmission-types";
import { carDriveTypes } from "@/db/sqlite/schema/cars/car-drive-types";
import { carConditionTypes } from "@/db/sqlite/schema/cars/car-condition-types";
import { createId } from "@paralleldrive/cuid2";

export const cars = sqliteTable(
	"cars",
	{
		id: text("id").primaryKey().$defaultFn(() => createId()),
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
			.references(() => carBodyTypes.id, { onDelete: "restrict" }),
		fuelTypeId: text("fuel_type_id")
			.notNull()
			.references(() => carFuelTypes.id, { onDelete: "restrict" }),
		transmissionTypeId: text("transmission_type_id")
			.notNull()
			.references(() => carTransmissionTypes.id, { onDelete: "restrict" }),
		driveTypeId: text("drive_type_id")
			.notNull()
			.references(() => carDriveTypes.id, { onDelete: "restrict" }),
		conditionTypeId: text("condition_type_id")
			.notNull()
			.references(() => carConditionTypes.id, { onDelete: "restrict" }),

		// Car-specific attributes
		numberPlate: text("number_plate").notNull(),
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
		availabilityIdx: index("cars_availability_idx").on(table.isAvailable),
		priceIdx: index("cars_price_idx").on(table.pricePerDay),
	}),
);

export const carsRelations = relations(cars, ({ one, many }) => ({
	model: one(carModels, {
		fields: [cars.modelId],
		references: [carModels.id],
	}),
	bodyType: one(carBodyTypes, {
		fields: [cars.bodyTypeId],
		references: [carBodyTypes.id],
	}),
	fuelType: one(carFuelTypes, {
		fields: [cars.fuelTypeId],
		references: [carFuelTypes.id],
	}),
	transmissionType: one(carTransmissionTypes, {
		fields: [cars.transmissionTypeId],
		references: [carTransmissionTypes.id],
	}),
	driveType: one(carDriveTypes, {
		fields: [cars.driveTypeId],
		references: [carDriveTypes.id],
	}),
	conditionType: one(carConditionTypes, {
		fields: [cars.conditionTypeId],
		references: [carConditionTypes.id],
	}),
	images: many(carImages),
	features: many(carFeatures),
}));
