import { and, eq, inArray, isNull, not } from "drizzle-orm";
import type { DB } from "@/db";
import { bookings, cars } from "@/db/schema";
import { BookingStatusEnum, CarStatusEnum } from "@/db/sqlite/enums";

export async function updateCarStatusOnBookingCreate(
	db: DB,
	carId: string,
	tx?: any,
) {
	const dbInstance = tx || db;

	// Update car status to booked
	await dbInstance
		.update(cars)
		.set({
			status: CarStatusEnum.Booked,
			updatedAt: new Date(),
		})
		.where(eq(cars.id, carId));
}

export async function updateCarStatusOnBookingUpdate(
	db: DB,
	carId: string,
	status: BookingStatusEnum,
	tx?: any,
) {
	const dbInstance = tx || db;

	let carStatus: CarStatusEnum;

	switch (status) {
		case BookingStatusEnum.InProgress:
			carStatus = CarStatusEnum.InService;
			break;
		case BookingStatusEnum.Completed:
		case BookingStatusEnum.Cancelled:
			carStatus = CarStatusEnum.Available;
			break;
		default:
			carStatus = CarStatusEnum.Booked;
			break;
	}

	await dbInstance
		.update(cars)
		.set({
			status: carStatus,
			updatedAt: new Date(),
		})
		.where(eq(cars.id, carId));
}

export async function updateCarStatusOnBookingCancel(
	db: DB,
	carId: string,
	tx?: any,
) {
	const dbInstance = tx || db;

	// Check if car has other active bookings
	const activeBookings = await dbInstance
		.select({ id: bookings.id })
		.from(bookings)
		.where(
			and(
				eq(bookings.carId, carId),
				not(
					inArray(bookings.status, [
						BookingStatusEnum.Cancelled,
						BookingStatusEnum.Completed,
					]),
				),
			),
		)
		.limit(1);

	// Only set to available if no other active bookings
	if (activeBookings.length === 0) {
		await dbInstance
			.update(cars)
			.set({
				status: CarStatusEnum.Available,
				updatedAt: new Date(),
			})
			.where(eq(cars.id, carId));
	}
}

export async function checkAndUpdateCarAvailability(
	db: DB,
	carId: string,
	tx?: any,
) {
	const dbInstance = tx || db;

	// Get car's current active bookings
	const activeBookings = await dbInstance
		.select({
			id: bookings.id,
			status: bookings.status,
			scheduledPickupTime: bookings.scheduledPickupTime,
		})
		.from(bookings)
		.where(
			and(
				eq(bookings.carId, carId),
				not(
					inArray(bookings.status, [
						BookingStatusEnum.Cancelled,
						BookingStatusEnum.Completed,
					]),
				),
			),
		);

	let newStatus: CarStatusEnum = CarStatusEnum.Available;

	if (activeBookings.length > 0) {
		// Check if any booking is currently in progress
		const inProgressBooking = activeBookings.find(
			(booking: (typeof activeBookings)[0]) =>
				booking.status === BookingStatusEnum.InProgress,
		);
		if (inProgressBooking) {
			newStatus = CarStatusEnum.InService;
		} else {
			// Find the nearest upcoming booking
			const now = Math.floor(Date.now() / 1000);
			const nearestBooking = activeBookings
				.filter(
					(booking: (typeof activeBookings)[0]) =>
						booking.scheduledPickupTime && booking.scheduledPickupTime > now,
				)
				.sort(
					(a: (typeof activeBookings)[0], b: (typeof activeBookings)[0]) =>
						(a.scheduledPickupTime || 0) - (b.scheduledPickupTime || 0),
				)[0];

			if (nearestBooking) {
				newStatus = CarStatusEnum.Booked;
			}
		}
	}

	// Update car status
	await dbInstance
		.update(cars)
		.set({
			status: newStatus,
			updatedAt: new Date(),
		})
		.where(eq(cars.id, carId));

	return newStatus;
}
