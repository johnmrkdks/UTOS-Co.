import { z } from "zod/v3"
import { CarStatusEnum } from "server/types"

// Zod schema for car features
export const CarFeatureSchema = z.object({
	name: z.string().min(1, "Feature name is required"),
})

// Zod schema for car images
export const CarImageSchema = z.object({
	url: z.string().url("Please enter a valid URL"),
	altText: z.string().optional(),
	order: z.coerce.number().min(1).int(),
	isMain: z.boolean(),
})

// Updated main car form schema
export const CarFormSchema = z.object({
	name: z.string().min(1, "Car name is required"),
	description: z.string().min(1, "Description is required"),

	// Vehicle identification
	licensePlate: z.string().min(1, "License plate is required"),
	vinNumber: z.string().optional(),

	// Foreign keys to normalized tables
	modelId: z.string().min(1, "Model is required"),
	bodyTypeId: z.string().min(1, "Body type is required"),
	fuelTypeId: z.string().min(1, "Fuel type is required"),
	transmissionTypeId: z.string().min(1, "Transmission type is required"),
	driveTypeId: z.string().min(1, "Drive type is required"),
	conditionTypeId: z.string().min(1, "Condition type is required"),
	categoryId: z.string().min(1, "Category is required"),

	// Vehicle specifications
	color: z.string().min(1, "Color is required"),
	engineSize: z.coerce.number().min(1, "Engine size must be greater than 0"),
	doors: z.coerce.number().min(2).max(8, "Doors must be between 2 and 8"),
	cylinders: z.coerce.number().min(1, "Cylinders must be greater than 0"),
	mileage: z.coerce.number().min(0, "Mileage must be 0 or greater"),

	// Passenger capacity
	seatingCapacity: z.coerce.number().min(1, "Seating capacity must be at least 1"),
	luggageCapacity: z.string().optional(),

	// Service availability
	availableForPackages: z.boolean(),
	availableForCustom: z.boolean(),

	// Maintenance and compliance
	insuranceExpiry: z.date().optional(),
	registrationExpiry: z.date().optional(),
	lastServiceDate: z.date().optional(),
	nextServiceDue: z.date().optional(),

	// Operational status
	isActive: z.boolean(),
	isAvailable: z.boolean(),
	status: z.nativeEnum(CarStatusEnum),

	// Arrays for related data
	features: z.array(CarFeatureSchema),
	images: z.array(CarImageSchema),
})
