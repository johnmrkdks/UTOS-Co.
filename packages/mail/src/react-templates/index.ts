import { render } from "@react-email/render";
import TripStatusEmail from "./trip-status-email";
import DriverAssignmentEmail from "./driver-assignment-email";

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
	vehicleInfo: string;
	websiteUrl: string;
	status?: string; // For status-based styling
	stops?: Array<{ address: string }>; // For intermediate stops
	passengerCount?: number;
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

export async function renderTripStatusEmail(data: TripStatusData): Promise<{ subject: string; html: string }> {
	const html = await render(TripStatusEmail(data));
	const subject = `${data.statusTitle} - Booking ${data.bookingReference}`;

	return { subject, html };
}

export async function renderDriverAssignmentEmail(data: DriverAssignmentData): Promise<{ subject: string; html: string }> {
	const html = await render(DriverAssignmentEmail(data));
	const subject = `New Booking Assignment - ${data.bookingReference}`;

	return { subject, html };
}

// Export the React components for external use
export { TripStatusEmail, DriverAssignmentEmail };