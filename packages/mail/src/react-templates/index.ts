import { render } from "@react-email/render";
import AdminNewBookingEmail from "./admin-new-booking-email";
import BookingConfirmationEmail from "./booking-confirmation-email";
import DriverAssignmentEmail from "./driver-assignment-email";
import TripStatusEmail from "./trip-status-email";

export interface TripStatusData {
	customerName: string;
	statusTitle: string;
	statusMessage: string;
	bookingReference: string;
	serviceType: string;
	pickupDate: string;
	pickupTime: string;
	originAddress: string;
	destinationAddress?: string;
	driverName: string;
	driverPhone?: string;
	driverEmail?: string;
	vehicleInfo: string;
	websiteUrl: string;
	status?: string; // For status-based styling
	stops?: Array<{ address: string }>; // For intermediate stops
	passengerCount?: number;
	// Fare breakdown fields (for completed trips)
	baseFare?: number;
	distanceFare?: number;
	extraCharges?: number;
	finalAmount?: number;
	actualDistance?: number;
	estimatedDistance?: number;
	// Detailed extras breakdown
	extrasDetails?: {
		additionalWaitTime?: number;
		unscheduledStops?: number;
		parkingCharges?: number;
		tollCharges?: number;
		tollLocation?: string;
		otherChargesDescription?: string;
		otherChargesAmount?: number;
		notes?: string;
	};
}

export interface DriverAssignmentData {
	driverName: string;
	customerName: string;
	bookingReference: string;
	serviceType: string;
	pickupDate: string;
	pickupTime: string;
	originAddress: string;
	destinationAddress?: string;
	vehicleInfo: string;
	websiteUrl: string;
	stops?: Array<{ address: string }>; // For intermediate stops
	passengerCount?: number;
	customerPhone?: string;
}

export interface BookingConfirmationData {
	customerName: string;
	bookingReference: string;
	serviceType: string;
	pickupDate: string;
	pickupTime: string;
	originAddress: string;
	destinationAddress?: string;
	vehicleInfo: string;
	websiteUrl: string;
	stops?: Array<{ address: string }>;
	passengerCount?: number;
	quotedAmount?: number;
}

export interface AdminNewBookingData {
	adminName?: string;
	customerName: string;
	customerEmail: string;
	customerPhone?: string;
	bookingReference: string;
	serviceType: string;
	pickupDate: string;
	pickupTime: string;
	originAddress: string;
	destinationAddress?: string;
	vehicleInfo: string;
	websiteUrl: string;
	stops?: Array<{ address: string }>;
	passengerCount?: number;
	luggageCount?: number;
	specialRequests?: string;
	quotedAmount?: number;
}

export async function renderTripStatusEmail(
	data: TripStatusData,
): Promise<{ subject: string; html: string }> {
	const html = await render(TripStatusEmail(data));
	const subject = `${data.statusTitle} - Booking ${data.bookingReference}`;

	return { subject, html };
}

export async function renderDriverAssignmentEmail(
	data: DriverAssignmentData,
): Promise<{ subject: string; html: string }> {
	const html = await render(DriverAssignmentEmail(data));
	const subject = `New Booking Assignment - ${data.bookingReference}`;

	return { subject, html };
}

export async function renderBookingConfirmationEmail(
	data: BookingConfirmationData,
): Promise<{ subject: string; html: string }> {
	const html = await render(BookingConfirmationEmail(data));
	// Show only last 6 characters of reference (e.g., #ABC123 instead of DUC-ABC123)
	const shortRef = `#${data.bookingReference.slice(-6)}`;
	const subject = `Booking Confirmed - ${shortRef}`;

	return { subject, html };
}

export async function renderAdminNewBookingEmail(
	data: AdminNewBookingData,
): Promise<{ subject: string; html: string }> {
	const html = await render(AdminNewBookingEmail(data));
	const subject = `New Booking - ${data.bookingReference}`;

	return { subject, html };
}

// Export the React components for external use
export {
	TripStatusEmail,
	DriverAssignmentEmail,
	BookingConfirmationEmail,
	AdminNewBookingEmail,
};
