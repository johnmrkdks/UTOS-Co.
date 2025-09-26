import { updateBooking } from "@/data/bookings/update-booking";
import { getBookingById } from "@/data/bookings/get-booking-by-id";
import type { DB } from "@/db";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import type { UpdateBooking } from "@/schemas/shared";
import { sendDriverAssignmentNotification, sendTripStatusNotification } from "@/services/notifications/booking-email-notification-service";
import type { Env } from "@/types/env";
import { ErrorFactory } from "@/utils/error-factory";
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
	console.log(`🔍 UPDATE STATUS DEBUG: Starting updateBookingStatusService for booking ${data.id} with status ${data.status}`);

	try {
		// For statuses that require starting a trip, validate car assignment
		const statusesRequiringCar = [
			BookingStatusEnum.DriverEnRoute,
			BookingStatusEnum.InProgress, // Legacy status
			BookingStatusEnum.PassengerOnBoard,
		];

		if (statusesRequiringCar.includes(data.status)) {
			console.log(`🚗 UPDATE STATUS DEBUG: Status requires car validation: ${data.status}`);

			// Get the current booking to check car assignment
			const existingBooking = await getBookingById(db, data.id);

			if (!existingBooking) {
				console.error(`❌ UPDATE STATUS DEBUG: Booking ${data.id} not found`);
				throw ErrorFactory.notFound("Booking");
			}

			console.log(`📋 UPDATE STATUS DEBUG: Found booking ${data.id}, carId: ${existingBooking.carId}`);

			if (!existingBooking.carId) {
				console.error(`❌ UPDATE STATUS DEBUG: No car assigned to booking ${data.id}`);
				throw ErrorFactory.badRequest(
					"Unable to start trip - no vehicle assigned to this booking. Please contact an administrator to assign a vehicle before starting the trip."
				);
			}

			console.log(`✅ UPDATE STATUS DEBUG: Car validation passed for booking ${data.id}`);
		}
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
				throw ErrorFactory.badRequest("Driver ID is required when assigning a driver");
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

		console.log(`💾 UPDATE STATUS DEBUG: Updating booking in database with data:`, JSON.stringify(updateData, null, 2));
		const result = await updateBooking(db, { id: data.id, data: updateData });
		console.log(`✅ UPDATE STATUS DEBUG: Database update completed successfully for booking ${data.id}`);

		// Send email notifications after successful booking update
		console.log(`📧 EMAIL DEBUG: Checking email notification conditions for booking ${data.id}`);
		console.log(`📧 EMAIL DEBUG: env available: ${!!env}, result available: ${!!result}, status: ${data.status}`);

		if (env && result) {
		console.log(`✅ EMAIL DEBUG: Entering email notification block for status ${data.status}`);
		try {
			switch (data.status) {
				case BookingStatusEnum.DriverAssigned:
					console.log(`🚗 EMAIL DEBUG: Driver assignment case - driverId: ${data.driverId}`);
					if (data.driverId) {
						console.log(`📧 EMAIL DEBUG: Calling sendDriverAssignmentNotification for booking ${data.id}, driver ${data.driverId}`);
						await sendDriverAssignmentNotification({
							bookingId: data.id,
							driverId: data.driverId,
							env,
						});
						console.log(`✅ Driver assignment notification sent for booking ${data.id}`);
					} else {
						console.log(`❌ EMAIL DEBUG: No driverId provided for driver assignment`);
					}
					break;

				case BookingStatusEnum.InProgress:
				case BookingStatusEnum.PassengerOnBoard:
					console.log(`📧 EMAIL DEBUG: Trip status case - InProgress/PassengerOnBoard`);
					await sendTripStatusNotification({
						bookingId: data.id,
						status: data.status,
						env,
					});
					console.log(`✅ Trip status notification sent for booking ${data.id}, status: ${data.status}`);
					break;

				case BookingStatusEnum.DriverEnRoute:
				case BookingStatusEnum.ArrivedPickup:
				case BookingStatusEnum.Completed:
					console.log(`🎯 EMAIL DEBUG: COMPLETION EMAIL CASE - Processing completed status for booking ${data.id}`);
					console.log(`📧 EMAIL DEBUG: Trip status case - ${data.status}`);
					await sendTripStatusNotification({
						bookingId: data.id,
						status: data.status,
						env,
					});
					console.log(`✅ COMPLETION EMAIL: Trip status notification sent for booking ${data.id}, status: ${data.status}`);
					break;

				default:
					console.log(`⏭️  EMAIL DEBUG: No email notification case for status: ${data.status}`);
					break;
			}
		} catch (emailError) {
			// Log email errors but don't fail the booking update
			console.error(`❌ EMAIL DEBUG: Failed to send email notification for booking ${data.id}:`, emailError);
			console.error(`❌ EMAIL DEBUG: Email error stack:`, emailError instanceof Error ? emailError.stack : 'No stack trace');
		}
	} else {
		console.log(`⏭️  EMAIL DEBUG: Skipping email notifications - env: ${!!env}, result: ${!!result}`);
	}

	console.log(`✅ UPDATE STATUS DEBUG: Successfully completed updateBookingStatusService for booking ${data.id}`);
	return result;

	} catch (error) {
		console.error(`❌ UPDATE STATUS DEBUG: Error in updateBookingStatusService for booking ${data.id}:`, error);
		console.error(`❌ UPDATE STATUS DEBUG: Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
		console.error(`❌ UPDATE STATUS DEBUG: Error details:`, {
			bookingId: data.id,
			status: data.status,
			errorMessage: error instanceof Error ? error.message : 'Unknown error',
			errorName: error instanceof Error ? error.name : 'Unknown',
		});
		throw error; // Re-throw to let tRPC handle it
	}
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