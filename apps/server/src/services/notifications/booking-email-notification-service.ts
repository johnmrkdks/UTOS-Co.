import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/sqlite/schema/bookings";
import { drivers } from "@/db/sqlite/schema/drivers";
import { users } from "@/db/sqlite/schema/users";
import { cars } from "@/db/sqlite/schema/cars";
import { packages } from "@/db/sqlite/schema/packages";
import { bookingStops } from "@/db/sqlite/schema/bookings/booking-stops";
import { getMailService } from "@workspace/mail";
import type { Env } from "@/types/env";

interface DriverAssignmentEmailData {
	bookingId: string;
	driverId: string;
	env: Env;
}

interface TripStatusEmailData {
	bookingId: string;
	status: string;
	env: Env;
}

interface BookingDetailsForEmail {
	booking: any;
	driver?: any;
	driverUser?: any;
	customer?: any;
	car?: any;
	package?: any;
	stops?: any[];
}

/**
 * Get comprehensive booking details for email notifications
 */
async function getBookingDetailsForEmail(bookingId: string): Promise<BookingDetailsForEmail> {
	// Get booking with all related data
	const bookingData = await db
		.select({
			booking: bookings,
			driver: drivers,
			driverUser: users,
			car: cars,
			package: packages,
		})
		.from(bookings)
		.leftJoin(drivers, eq(bookings.driverId, drivers.id))
		.leftJoin(users, eq(drivers.userId, users.id)) // Driver user
		.leftJoin(cars, eq(bookings.carId, cars.id))
		.leftJoin(packages, eq(bookings.packageId, packages.id))
		.where(eq(bookings.id, bookingId))
		.get();

	if (!bookingData) {
		throw new Error(`Booking ${bookingId} not found`);
	}

	// Get customer data separately to avoid alias conflicts
	const customer = await db
		.select()
		.from(users)
		.where(eq(users.id, bookingData.booking.userId))
		.get();

	// Get booking stops if any
	const stops = await db
		.select()
		.from(bookingStops)
		.where(eq(bookingStops.bookingId, bookingId))
		.orderBy(bookingStops.stopOrder);

	return {
		booking: bookingData.booking,
		driver: bookingData.driver,
		driverUser: bookingData.driverUser,
		customer,
		car: bookingData.car,
		package: bookingData.package,
		stops,
	};
}

/**
 * Generate HTML template for driver assignment notification
 */
function generateDriverAssignmentEmailTemplate(
	driverName: string,
	bookingDetails: BookingDetailsForEmail
): { subject: string; html: string } {
	const { booking, customer, car, package: pkg, stops } = bookingDetails;

	// Format pickup date and time
	const pickupDate = new Date(booking.pickupDateTime).toLocaleDateString("en-AU", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const pickupTime = new Date(booking.pickupDateTime).toLocaleTimeString("en-AU", {
		hour: "2-digit",
		minute: "2-digit",
	});

	// Build route information
	let routeInfo = `<strong>Pickup:</strong> ${booking.pickupAddress}<br/>`;

	if (stops && stops.length > 0) {
		routeInfo += `<strong>Stops:</strong><br/>`;
		stops.forEach((stop, index) => {
			routeInfo += `${index + 1}. ${stop.address}`;
			if (stop.waitingTime > 0) {
				routeInfo += ` (${stop.waitingTime} min wait)`;
			}
			routeInfo += `<br/>`;
		});
	}

	if (booking.destinationAddress) {
		routeInfo += `<strong>Destination:</strong> ${booking.destinationAddress}`;
	}

	// Service type and vehicle info
	const serviceType = pkg ? `Package Service: ${pkg.title}` : "Custom Booking";
	const vehicleInfo = car ? `${car.brand} ${car.model} (${car.category})` : "Vehicle to be assigned";

	const subject = `New Booking Assignment - ${pickupDate}`;

	const html = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>${subject}</title>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
				.content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
				.footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; font-size: 14px; color: #6b7280; }
				.booking-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
				.detail-row { margin-bottom: 10px; }
				.label { font-weight: bold; color: #374151; }
				.value { color: #1f2937; }
				.highlight { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 0 4px 4px 0; }
				.button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
				.button:hover { background: #2563eb; }
			</style>
		</head>
		<body>
			<div class="header">
				<h1>🚗 New Booking Assignment</h1>
				<p>Down Under Chauffeur</p>
			</div>

			<div class="content">
				<p>Hello <strong>${driverName}</strong>,</p>

				<p>You have been assigned a new booking. Please review the details below and confirm your availability.</p>

				<div class="highlight">
					<strong>Booking ID:</strong> ${booking.id}<br/>
					<strong>Scheduled Pickup:</strong> ${pickupDate} at ${pickupTime}
				</div>

				<div class="booking-card">
					<h3>📍 Trip Details</h3>
					<div class="detail-row">
						<span class="label">Service Type:</span> <span class="value">${serviceType}</span>
					</div>
					<div class="detail-row">
						<span class="label">Vehicle:</span> <span class="value">${vehicleInfo}</span>
					</div>
					<div class="detail-row">
						<span class="label">Route:</span><br/>
						<span class="value">${routeInfo}</span>
					</div>
					${booking.passengerCount ? `
					<div class="detail-row">
						<span class="label">Passengers:</span> <span class="value">${booking.passengerCount}</span>
					</div>
					` : ''}
					${booking.specialRequirements ? `
					<div class="detail-row">
						<span class="label">Special Requirements:</span> <span class="value">${booking.specialRequirements}</span>
					</div>
					` : ''}
				</div>

				<div class="booking-card">
					<h3>👤 Customer Information</h3>
					<div class="detail-row">
						<span class="label">Name:</span> <span class="value">${customer?.name || 'Not provided'}</span>
					</div>
					<div class="detail-row">
						<span class="label">Email:</span> <span class="value">${customer?.email || 'Not provided'}</span>
					</div>
					${booking.customerPhone ? `
					<div class="detail-row">
						<span class="label">Phone:</span> <span class="value">${booking.customerPhone}</span>
					</div>
					` : ''}
				</div>

				<div class="highlight">
					<p><strong>Next Steps:</strong></p>
					<ol>
						<li>Review the trip details carefully</li>
						<li>Log into your driver portal to accept or decline</li>
						<li>Contact the customer if you have any questions</li>
						<li>Arrive at pickup location on time</li>
					</ol>
				</div>
			</div>

			<div class="footer">
				<p>This is an automated notification from Down Under Chauffeur.</p>
				<p>For support, contact our admin team.</p>
			</div>
		</body>
		</html>
	`;

	return { subject, html };
}

/**
 * Generate HTML template for trip status notification to customer
 */
function generateTripStatusEmailTemplate(
	status: string,
	bookingDetails: BookingDetailsForEmail
): { subject: string; html: string } {
	const { booking, driverUser, car, package: pkg } = bookingDetails;

	// Format pickup date and time
	const pickupDate = new Date(booking.pickupDateTime).toLocaleDateString("en-AU", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const pickupTime = new Date(booking.pickupDateTime).toLocaleTimeString("en-AU", {
		hour: "2-digit",
		minute: "2-digit",
	});

	// Status-specific content
	let statusTitle = "";
	let statusMessage = "";
	let statusIcon = "";

	switch (status) {
		case "in_progress":
		case "passenger_on_board":
			statusTitle = "Your Trip Has Started";
			statusMessage = "Your driver has started your trip. You should now be en route to your destination.";
			statusIcon = "🚗";
			break;
		case "driver_en_route":
			statusTitle = "Driver En Route";
			statusMessage = "Your driver is on the way to pick you up. Please be ready at the designated pickup location.";
			statusIcon = "🚗";
			break;
		case "arrived_pickup":
			statusTitle = "Driver Has Arrived";
			statusMessage = "Your driver has arrived at the pickup location. Please proceed to the vehicle.";
			statusIcon = "📍";
			break;
		case "completed":
			statusTitle = "Trip Completed";
			statusMessage = "Your trip has been completed successfully. Thank you for choosing Down Under Chauffeur!";
			statusIcon = "✅";
			break;
		default:
			statusTitle = "Booking Status Update";
			statusMessage = "Your booking status has been updated.";
			statusIcon = "📋";
	}

	const serviceType = pkg ? pkg.title : "Custom Trip";
	const vehicleInfo = car ? `${car.brand} ${car.model}` : "Assigned Vehicle";
	const driverName = driverUser?.name || "Your Driver";

	const subject = `${statusTitle} - Booking ${booking.id}`;

	const html = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>${subject}</title>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
				.content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
				.footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; font-size: 14px; color: #6b7280; }
				.status-card { background: #f0f9ff; border: 1px solid #0284c7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
				.booking-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
				.detail-row { margin-bottom: 10px; }
				.label { font-weight: bold; color: #374151; }
				.value { color: #1f2937; }
				.highlight { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 0 4px 4px 0; }
			</style>
		</head>
		<body>
			<div class="header">
				<h1>${statusIcon} ${statusTitle}</h1>
				<p>Down Under Chauffeur</p>
			</div>

			<div class="content">
				<div class="status-card">
					<h2>${statusTitle}</h2>
					<p style="font-size: 16px; margin: 10px 0;">${statusMessage}</p>
					<p><strong>Booking ID:</strong> ${booking.id}</p>
				</div>

				<div class="booking-card">
					<h3>📋 Trip Details</h3>
					<div class="detail-row">
						<span class="label">Service:</span> <span class="value">${serviceType}</span>
					</div>
					<div class="detail-row">
						<span class="label">Scheduled Pickup:</span> <span class="value">${pickupDate} at ${pickupTime}</span>
					</div>
					<div class="detail-row">
						<span class="label">Pickup Location:</span> <span class="value">${booking.pickupAddress}</span>
					</div>
					${booking.destinationAddress ? `
					<div class="detail-row">
						<span class="label">Destination:</span> <span class="value">${booking.destinationAddress}</span>
					</div>
					` : ''}
				</div>

				<div class="booking-card">
					<h3>🚗 Driver & Vehicle</h3>
					<div class="detail-row">
						<span class="label">Driver:</span> <span class="value">${driverName}</span>
					</div>
					<div class="detail-row">
						<span class="label">Vehicle:</span> <span class="value">${vehicleInfo}</span>
					</div>
				</div>

				${status === "completed" ? `
				<div class="highlight">
					<p><strong>Thank you for choosing Down Under Chauffeur!</strong></p>
					<p>We hope you enjoyed your luxury travel experience. Your feedback is valuable to us.</p>
				</div>
				` : ''}
			</div>

			<div class="footer">
				<p>This is an automated notification from Down Under Chauffeur.</p>
				<p>For support or questions, please contact our customer service team.</p>
			</div>
		</body>
		</html>
	`;

	return { subject, html };
}

/**
 * Send driver assignment notification email
 */
export async function sendDriverAssignmentNotification(data: DriverAssignmentEmailData): Promise<{ success: boolean; message: string }> {
	try {
		const { bookingId, driverId, env } = data;
		console.log(`📧 EMAIL SERVICE: Starting driver assignment notification for booking ${bookingId}, driver ${driverId}`);

		// Get booking details
		console.log(`📧 EMAIL SERVICE: Fetching booking details for booking ${bookingId}`);
		const bookingDetails = await getBookingDetailsForEmail(bookingId);
		console.log(`📧 EMAIL SERVICE: Booking details fetched. Driver user email: ${bookingDetails.driverUser?.email}`);

		if (!bookingDetails.driverUser?.email) {
			console.log(`❌ EMAIL SERVICE: Driver email not found for driver ${driverId}`);
			throw new Error("Driver email not found");
		}

		// Generate email template
		const driverName = bookingDetails.driverUser.name || "Driver";
		console.log(`📧 EMAIL SERVICE: Generating email template for driver ${driverName}`);
		const template = generateDriverAssignmentEmailTemplate(driverName, bookingDetails);

		// Send email
		console.log(`📧 EMAIL SERVICE: Getting mail service and sending email to ${bookingDetails.driverUser.email}`);
		const mailService = getMailService(env);
		const success = await mailService.sendEmail({
			to: bookingDetails.driverUser.email,
			subject: template.subject,
			html: template.html,
		});
		console.log(`📧 EMAIL SERVICE: Email send result: ${success}`);

		if (!success) {
			throw new Error("Failed to send driver assignment email");
		}

		return {
			success: true,
			message: `Driver assignment notification sent to ${bookingDetails.driverUser.email}`,
		};
	} catch (error) {
		console.error("Error sending driver assignment notification:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

/**
 * Send trip status notification email to customer
 */
export async function sendTripStatusNotification(data: TripStatusEmailData): Promise<{ success: boolean; message: string }> {
	try {
		const { bookingId, status, env } = data;

		// Get booking details
		const bookingDetails = await getBookingDetailsForEmail(bookingId);

		if (!bookingDetails.customer?.email) {
			throw new Error("Customer email not found");
		}

		// Generate email template
		const template = generateTripStatusEmailTemplate(status, bookingDetails);

		// Send email
		const mailService = getMailService(env);
		const success = await mailService.sendEmail({
			to: bookingDetails.customer.email,
			subject: template.subject,
			html: template.html,
		});

		if (!success) {
			throw new Error("Failed to send trip status email");
		}

		return {
			success: true,
			message: `Trip status notification sent to ${bookingDetails.customer.email}`,
		};
	} catch (error) {
		console.error("Error sending trip status notification:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}