import { z } from "zod/v3"

// Zod schema for car features
export const CarFeatureSchema = z.object({
	name: z.string().min(1, "Feature name is required"),
})

// Zod schema for car images
export const CarImageSchema = z.object({
	url: z.string().url("Please enter a valid URL"),
	altText: z.string().optional(),
	order: z.number().min(0).default(0),
	isMain: z.boolean().default(false),
})

// Main car form schema
export const AddCarFormSchema = z.object({
	name: z.string().min(1, "Car name is required"),
	description: z.string().min(1, "Description is required"),
	dateManufactured: z.date({
		required_error: "Manufacturing date is required",
	}),
	modelId: z.string().min(1, "Model is required"),
	bodyTypeId: z.string().min(1, "Body type is required"),
	fuelTypeId: z.string().min(1, "Fuel type is required"),
	transmissionTypeId: z.string().min(1, "Transmission type is required"),
	driveTypeId: z.string().min(1, "Drive type is required"),
	conditionTypeId: z.string().min(1, "Condition type is required"),
	licensePlate: z.string().min(1, "License plate is required"),
	mileage: z.number().min(0, "Mileage must be 0 or greater"),
	color: z.string().min(1, "Color is required"),
	engineSize: z.number().min(1, "Engine size must be greater than 0"),
	doors: z.number().min(2).max(8, "Doors must be between 2 and 8"),
	cylinders: z.number().min(1, "Cylinders must be greater than 0"),
	pricePerDay: z.number().min(0, "Price per day must be 0 or greater").optional(),
	pricePerKm: z.number().min(0, "Price per km must be 0 or greater").optional(),
	features: z.array(CarFeatureSchema).default([]),
	images: z.array(CarImageSchema).default([]),
})
