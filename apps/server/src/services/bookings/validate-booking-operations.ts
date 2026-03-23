import type { TRPCError } from "@trpc/server";
import { getActiveBookingPolicy } from "@/data/booking-policies/get-active-booking-policy";
import type { DB } from "@/db";

export interface BookingOperationValidation {
	canEdit: boolean;
	canCancel: boolean;
	editReason?: string;
	cancelReason?: string;
	cancellationFeePercentage?: number;
	hoursUntilPickup?: number;
	hasDriverAssigned?: boolean;
}

export interface BookingForValidation {
	scheduledPickupTime: Date | number;
	driverAssignedAt?: Date | number | null;
	status: string;
}

export async function validateBookingOperations(
	db: DB,
	booking: BookingForValidation,
): Promise<BookingOperationValidation> {
	console.log("🔍 validateBookingOperations - START");
	console.log("📋 Input booking:", JSON.stringify(booking, null, 2));

	try {
		// For now, skip database policy lookup and use default values directly
		// This avoids the "table doesn't exist" error until we properly set up the booking_policies table
		console.log("⚠️ Using default policy (4 hours) - skipping database lookup");

		const defaultPolicy = {
			editAllowedHours: 4,
			editDisabledAfterDriverAssignment: false,
			cancellationAllowedHours: 4,
			cancellationFeePercentage: 0,
			cancellationDisabledAfterDriverAssignment: false,
		};

		const now = new Date();
		const pickupTime = new Date(booking.scheduledPickupTime);
		const hoursUntilPickup =
			(pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);
		const hasDriverAssigned = !!booking.driverAssignedAt;

		console.log("⏰ Time calculations:", {
			now: now.toISOString(),
			pickupTime: pickupTime.toISOString(),
			hoursUntilPickup: hoursUntilPickup.toFixed(2),
			hasDriverAssigned,
		});

		// Check if booking is already completed or cancelled
		if (["completed", "cancelled"].includes(booking.status)) {
			console.log("❌ Booking is completed or cancelled, no actions allowed");
			return {
				canEdit: false,
				canCancel: false,
				editReason: `Cannot modify ${booking.status} booking`,
				cancelReason: `Cannot cancel ${booking.status} booking`,
				cancellationFeePercentage: 0,
				hoursUntilPickup,
				hasDriverAssigned,
			};
		}

		// Check edit permissions with default policy
		let canEdit = true;
		let editReason: string | undefined;

		if (hoursUntilPickup < defaultPolicy.editAllowedHours) {
			canEdit = false;
			editReason = `Edits must be made at least ${defaultPolicy.editAllowedHours} hours before pickup`;
			console.log("❌ Edit not allowed: too close to pickup time");
		} else {
			console.log("✅ Edit allowed");
		}

		// Check cancellation permissions with default policy
		let canCancel = true;
		let cancelReason: string | undefined;

		if (hoursUntilPickup < defaultPolicy.cancellationAllowedHours) {
			canCancel = false;
			cancelReason = `Cancellations must be made at least ${defaultPolicy.cancellationAllowedHours} hours before pickup`;
			console.log("❌ Cancel not allowed: too close to pickup time");
		} else if (
			hasDriverAssigned &&
			defaultPolicy.cancellationDisabledAfterDriverAssignment
		) {
			canCancel = false;
			cancelReason = "Cannot cancel booking after driver has been assigned";
			console.log("❌ Cancel not allowed: driver already assigned");
		} else {
			console.log("✅ Cancel allowed");
		}

		const result = {
			canEdit,
			canCancel,
			editReason,
			cancelReason,
			cancellationFeePercentage: defaultPolicy.cancellationFeePercentage,
			hoursUntilPickup,
			hasDriverAssigned,
		};

		console.log(
			"✅ validateBookingOperations - Final result:",
			JSON.stringify(result, null, 2),
		);
		return result;
	} catch (error) {
		console.error("💥 ERROR in validateBookingOperations:", error);
		console.error(
			"📚 Error stack:",
			error instanceof Error ? error.stack : "No stack trace",
		);
		throw error;
	}
}
