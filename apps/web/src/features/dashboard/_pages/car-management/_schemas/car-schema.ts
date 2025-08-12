import { z } from "zod/v3"
import { CarStatusEnum } from "server/types"

// Zod schema for car features
export const CarFeatureSchema = z.object({
	name: z.string().min(1, "Feature name is required"),
})

// Zod schema for car images
export const CarImageSchema = z.object({
	url: z.string()
		.min(1, "Image URL or path is required")
		.refine((value) => {
			// Allow full URLs or file paths/keys
			const isValidUrl = z.string().url().safeParse(value).success;
			const isValidPath = /^[a-zA-Z0-9._/-]+\.(jpg|jpeg|png|gif|webp)$/i.test(value);
			return isValidUrl || isValidPath;
		}, {
			message: "Please provide a valid URL or image file path"
		}),
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
	isPublished: z.boolean(),
	status: z.nativeEnum(CarStatusEnum),
	// Arrays for related data
	features: z.array(z.string()).optional(),
	images: z.array(CarImageSchema)
		.optional()
		.superRefine((images, ctx) => {
			if (!images || images.length === 0) return true; // Allow empty array

			// Check for valid URLs
			images.forEach((img, index) => {
				if (!img.url || img.url.trim() === '') {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `Image ${index + 1}: URL is required and cannot be empty`,
						path: [index, 'url']
					});
				}

				// Check for valid order
				if (!img.order || img.order < 1) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `Image ${index + 1}: Invalid order number`,
						path: [index, 'order']
					});
				}
			});

			// Check main image logic
			const mainImages = images.filter(img => img.isMain);
			if (mainImages.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "At least one image must be marked as the main image",
					path: []
				});
			} else if (mainImages.length > 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Only one image can be marked as main. Please uncheck the others.",
					path: []
				});
			}

			// Check for duplicate orders
			const orders = images.map(img => img.order);
			const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
			if (duplicateOrders.length > 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Images have duplicate order numbers. This usually happens during upload - try removing and re-uploading the images.",
					path: []
				});
			}
		}),
})
