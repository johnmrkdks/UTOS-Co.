import { cars } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { CarFeatureSchema } from "./cars/car-feature";
import { CarImageSchema, InsertCarImageSchema } from "./cars/car-image";
import { CarBrandSchema } from "./cars/car-brand";
import { CarModelSchema, CarModelWithBrandSchema } from "./cars/car-model";
import { CarFuelTypeSchema } from "./cars/car-fuel-type";
import { CarTransmissionTypeSchema } from "./cars/car-transmission-type";
import { CarBodyTypeSchema } from "./cars/car-body-type";
import { CarConditionTypeSchema } from "./cars/car-condition-type";
import { CarDriveTypeSchema } from "./cars/car-drive-type";
import { CarCategorySchema } from "./cars/car-category";
import { CarStatusEnum } from "@/types";

export const CarSchema = createSelectSchema(cars, {
	status: z.nativeEnum(CarStatusEnum),
	updatedAt: z.date().optional(),
}).extend({
	bodyType: CarBodyTypeSchema.optional(),
	conditionType: CarConditionTypeSchema.optional(),
	driveType: CarDriveTypeSchema.optional(),
	features: z.array(CarFeatureSchema).default([]).optional(),
	fuelType: CarFuelTypeSchema.optional(),
	images: z.array(CarImageSchema).default([]).optional(),
	model: CarModelWithBrandSchema.optional(),
	transmissionType: CarTransmissionTypeSchema.optional(),
	category: CarCategorySchema.optional(),
});
export const InsertCarSchema = createInsertSchema(cars).extend({
	images: z.array(InsertCarImageSchema).default([]).optional(),
});
export const UpdateCarSchema = createUpdateSchema(cars, {
	modelId: z.string().optional(),
});

export type Car = z.infer<typeof CarSchema>;
export type InsertCar = z.infer<typeof InsertCarSchema>;
export type UpdateCar = z.infer<typeof UpdateCarSchema>;
