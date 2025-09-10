import { updateBooking } from "@/data/bookings/update-booking";
import type { DB } from "@/db";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import type { UpdateBooking } from "@/schemas/shared";
import { z } from "zod";

export const UpdateBookingStatusSchema = z.object({
	id: z.string(),
	status: z.nativeEnum(BookingStatusEnum),
	driverId: z.string().optional(),
	actualPickupTime: z.date().optional(),
	actualDropoffTime: z.date().optional(),
	actualDistance: z.number().int().optional(),
	finalAmount: z.number().int().optional(),
	extraCharges: z.number().int().optional(),
});

export type UpdateBookingStatusParams = z.infer<typeof UpdateBookingStatusSchema>;

export async function updateBookingStatusService(db: DB, data: UpdateBookingStatusParams) {
	const updateData: UpdateBooking = {
		id: data.id,
		status: data.status,
		updatedAt: new Date(),
	};
	
	// Set timestamps based on status
	const now = new Date();
	
	switch (data.status) {
		case BookingStatusEnum.Confirmed:
			updateData.confirmedAt = now;
			break;
			
		case BookingStatusEnum.DriverAssigned:
			if (!data.driverId) {
				throw new Error("Driver ID is required when assigning a driver");
			}
			updateData.driverId = data.driverId;
			updateData.driverAssignedAt = now;
			break;
			
		case BookingStatusEnum.DriverEnRoute:
			updateData.driverEnRouteAt = now;
			break;
			
		case BookingStatusEnum.ArrivedPickup:
			// Driver has arrived at pickup location
			break;
			
		case BookingStatusEnum.PassengerOnBoard:
		case BookingStatusEnum.InProgress: // Legacy support
			updateData.serviceStartedAt = now;
			if (data.actualPickupTime) {
				updateData.actualPickupTime = data.actualPickupTime;
			}
			break;
			
		case BookingStatusEnum.DroppedOff:
			if (data.actualDropoffTime) {
				updateData.actualDropoffTime = data.actualDropoffTime;
			}
			break;
			
		case BookingStatusEnum.AwaitingExtras:
			if (data.extraCharges !== undefined) {
				updateData.extraCharges = data.extraCharges;
			}
			break;
			
		case BookingStatusEnum.Completed:
			updateData.serviceCompletedAt = now;
			if (data.actualDropoffTime) {
				updateData.actualDropoffTime = data.actualDropoffTime;
			}
			if (data.actualDistance) {
				updateData.actualDistance = data.actualDistance;
			}
			if (data.finalAmount) {
				updateData.finalAmount = data.finalAmount;
			}
			if (data.extraCharges !== undefined) {
				updateData.extraCharges = data.extraCharges;
			}
			break;
	}
	
	return await updateBooking(db, { id: data.id, data: updateData });
}

export const AssignDriverSchema = z.object({
	bookingId: z.string(),
	driverId: z.string(),
});

export type AssignDriverParams = z.infer<typeof AssignDriverSchema>;

export async function assignDriverService(db: DB, data: AssignDriverParams) {
	return await updateBookingStatusService(db, {
		id: data.bookingId,
		status: BookingStatusEnum.DriverAssigned,
		driverId: data.driverId,
	});
}