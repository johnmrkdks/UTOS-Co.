import { updateBooking } from "@/data/bookings/update-booking";
import type { DB } from "@/db";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import type { UpdateBooking } from "@/schemas/shared";
import { sendDriverAssignmentNotification, sendTripStatusNotification } from "@/services/notifications/booking-email-notification-service";
import type { Env } from "@/types/env";
import { z } from "zod";

export const UpdateBookingStatusSchema = z.object({
	id: z.string(),
	status: z.nativeEnum(BookingStatusEnum),
	driverId: z.string().optional(),
	actualPickupTime: z.date().optional(),
	actualDropoffTime: z.date().optional(),
	actualDistance: z.number().int().optional(),
	finalAmount: z.number().optional(),
	extraCharges: z.number().optional(),
});

export type UpdateBookingStatusParams = z.infer<typeof UpdateBookingStatusSchema>;

export async function updateBookingStatusService(db: DB, data: UpdateBookingStatusParams, env?: Env) {
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

	const result = await updateBooking(db, { id: data.id, data: updateData });

	// Send email notifications after successful booking update
	if (env && result) {
		try {
			switch (data.status) {
				case BookingStatusEnum.DriverAssigned:
					if (data.driverId) {
						await sendDriverAssignmentNotification({
							bookingId: data.id,
							driverId: data.driverId,
							env,
						});
						console.log(`Driver assignment notification sent for booking ${data.id}`);
					}
					break;

				case BookingStatusEnum.InProgress:
				case BookingStatusEnum.PassengerOnBoard:
					await sendTripStatusNotification({
						bookingId: data.id,
						status: data.status,
						env,
					});
					console.log(`Trip status notification sent for booking ${data.id}, status: ${data.status}`);
					break;

				case BookingStatusEnum.DriverEnRoute:
				case BookingStatusEnum.ArrivedPickup:
				case BookingStatusEnum.Completed:
					await sendTripStatusNotification({
						bookingId: data.id,
						status: data.status,
						env,
					});
					console.log(`Trip status notification sent for booking ${data.id}, status: ${data.status}`);
					break;
			}
		} catch (emailError) {
			// Log email errors but don't fail the booking update
			console.error(`Failed to send email notification for booking ${data.id}:`, emailError);
		}
	}

	return result;
}

export const AssignDriverSchema = z.object({
	bookingId: z.string(),
	driverId: z.string(),
});

export type AssignDriverParams = z.infer<typeof AssignDriverSchema>;

export async function assignDriverService(db: DB, data: AssignDriverParams, env?: Env) {
	return await updateBookingStatusService(db, {
		id: data.bookingId,
		status: BookingStatusEnum.DriverAssigned,
		driverId: data.driverId,
	}, env);
}