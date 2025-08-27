import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text, index, real } from "drizzle-orm/sqlite-core";
import { carImages } from "@/db/sqlite/schema/cars/car-images";
import { carModels } from "@/db/sqlite/schema/cars/car-models";
import { carBodyTypes } from "@/db/sqlite/schema/cars/car-body-types";
import { carFuelTypes } from "@/db/sqlite/schema/cars/car-fuel-types";
import { carTransmissionTypes } from "@/db/sqlite/schema/cars/car-transmission-types";
import { carDriveTypes } from "@/db/sqlite/schema/cars/car-drive-types";
import { carConditionTypes } from "@/db/sqlite/schema/cars/car-condition-types";
import { createId } from "@paralleldrive/cuid2";
import { CarStatusEnum } from "@/db/sqlite/enums";
import { carCategories } from "@/db/sqlite/schema/cars/car-categories";
import { carsToFeatures } from "./cars-to-features";

export const cars = sqliteTable(
	"cars",
	{
		id: text("id").primaryKey().$defaultFn(() => createId()),
		name: text("name").notNull(),
		description: text("description").notNull(),

		// Vehicle identification
		licensePlate: text("license_plate").notNull().unique(),
		vinNumber: text("vin_number"), // Vehicle Identification Number

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
		categoryId: text("category_id")
			.notNull()
			.references(() => carCategories.id, { onDelete: "restrict" }),

		// Vehicle specifications
		color: text("color").notNull(),
		engineSize: integer("engine_size").notNull(), // in CC
		doors: integer("doors").notNull(),
		cylinders: integer("cylinders").notNull(),
		mileage: integer("mileage").notNull(),

		// Passenger capacity (important for bookings)
		seatingCapacity: integer("seating_capacity").notNull().default(4),
		luggageCapacity: text("luggage_capacity"),

		// Service availability
		availableForPackages: integer("available_for_packages", { mode: "boolean" })
			.notNull()
			.default(true),
		availableForCustom: integer("available_for_custom", { mode: "boolean" })
			.notNull()
			.default(true),

		// Location tracking (for nearby car selection)
		currentLatitude: real("current_latitude"),
		currentLongitude: real("current_longitude"),
		lastLocationUpdate: integer("last_location_update", { mode: "timestamp" }),

		// Maintenance and compliance
		insuranceExpiry: integer("insurance_expiry", { mode: "timestamp" }),
		registrationExpiry: integer("registration_expiry", { mode: "timestamp" }),
		lastServiceDate: integer("last_service_date", { mode: "timestamp" }),
		nextServiceDue: integer("next_service_due", { mode: "timestamp" }),

		// Operational status
		isActive: integer("is_active", { mode: "boolean" })
			.notNull()
			.default(true), // Can be used for service
		isAvailable: integer("is_available", { mode: "boolean" })
			.notNull()
			.default(true), // Currently available for booking
		isPublished: integer("is_published", { mode: "boolean" })
			.notNull()
			.default(false), // Public visibility for customers

		// Service status tracking
		status: text("status").$type<CarStatusEnum>()
			.notNull()
			.default(CarStatusEnum.Available),

		// Timestamps
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(table) => ({
		availabilityIdx: index("cars_availability_idx").on(table.isAvailable, table.isActive),
		publishedAvailabilityIdx: index("cars_published_availability_idx").on(table.isPublished, table.isActive, table.isAvailable),
		categoryIdx: index("cars_category_idx").on(table.categoryId),
		statusIdx: index("cars_status_idx").on(table.status),
		locationIdx: index("cars_location_idx").on(table.currentLatitude, table.currentLongitude),
		licensePlateIdx: index("cars_license_plate_idx").on(table.licensePlate),
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
	category: one(carCategories, {
		fields: [cars.categoryId],
		references: [carCategories.id],
	}),
	images: many(carImages),
	carsToFeatures: many(carsToFeatures),
}));

// Relations for pricing config should be added to prevent circular imports
// The pricingConfig relation will be added from the pricing config side

export const carCategoriesRelations = relations(carCategories, ({ many }) => ({
	cars: many(cars),
}));
