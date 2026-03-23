import { and, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { CarStatusEnum } from "@/types";

export interface CarSelectionParams {
	passengerCount: number;
	scheduledPickupTime: Date;
	preferredCarId?: string; // Specific car ID from quote
	preferredCategoryId?: string; // Fallback to category preference
}

export async function selectAvailableCarService(
	db: DB,
	params: CarSelectionParams,
) {
	// For now, implement a simple car selection logic
	// In the future, this could include more sophisticated matching based on:
	// - Location proximity
	// - Driver availability
	// - Car category preferences
	// - Real-time availability checking

	const availableCars = await db.query.cars.findMany({
		where: and(
			eq(cars.isPublished, true),
			eq(cars.isActive, true),
			eq(cars.isAvailable, true),
			eq(cars.status, CarStatusEnum.Available),
		),
		with: {
			model: {
				with: {
					brand: true,
				},
			},
			category: true,
			bodyType: true,
			fuelType: true,
			transmissionType: true,
			driveType: true,
			conditionType: true,
			images: true,
			carsToFeatures: {
				with: {
					feature: true,
				},
			},
		},
	});

	if (availableCars.length === 0) {
		throw new Error("No cars available for the selected time");
	}

	// Filter by passenger capacity
	const suitableCars = availableCars.filter(
		(car) => car.seatingCapacity >= params.passengerCount,
	);

	if (suitableCars.length === 0) {
		throw new Error(
			`No cars available with capacity for ${params.passengerCount} passengers`,
		);
	}

	// PRIORITY 1: If a specific car ID is requested (from quote), try to use that exact car
	if (params.preferredCarId) {
		const exactCarMatch = suitableCars.find(
			(car) => car.id === params.preferredCarId,
		);
		if (exactCarMatch) {
			console.log("✅ Found exact car match from quote:", exactCarMatch.id);
			return exactCarMatch;
		}
		console.warn(
			`⚠️ Preferred car ${params.preferredCarId} not available, falling back to category/sorting`,
		);
	}

	// PRIORITY 2: If preferred category is specified, try to find a car in that category
	if (params.preferredCategoryId) {
		const categoryMatch = suitableCars.find(
			(car) => car.categoryId === params.preferredCategoryId,
		);
		if (categoryMatch) {
			console.log("✅ Found category match:", categoryMatch.categoryId);
			return categoryMatch;
		}
	}

	// Sort by preference criteria:
	// 1. Higher passenger capacity first (luxury vehicles)
	// 2. Newer model years
	// 3. Premium categories
	const sortedCars = suitableCars.sort((a, b) => {
		// Priority to luxury vehicles with higher capacity
		if (a.seatingCapacity !== b.seatingCapacity) {
			return b.seatingCapacity - a.seatingCapacity;
		}

		// Prefer newer model years
		if (a.model?.year !== b.model?.year) {
			return (b.model?.year || 0) - (a.model?.year || 0);
		}

		return 0;
	});

	// Return the most suitable car
	return sortedCars[0];
}

export async function getCarAvailability(
	db: DB,
	carId: string,
	scheduledPickupTime: Date,
) {
	// Check if car is available at the requested time
	// This would typically check against existing bookings
	// For now, return true if car exists and is published

	const car = await db.query.cars.findFirst({
		where: and(
			eq(cars.id, carId),
			eq(cars.isPublished, true),
			eq(cars.isActive, true),
			eq(cars.isAvailable, true),
			eq(cars.status, CarStatusEnum.Available),
		),
	});

	return !!car;
}
