import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/sqlite/schema/bookings";
import { drivers } from "@/db/sqlite/schema/drivers";
import { users } from "@/db/sqlite/schema/users";
import { cars } from "@/db/sqlite/schema/cars";
import { packages } from "@/db/sqlite/schema/packages";
import { bookingStops } from "@/db/sqlite/schema/bookings/booking-stops";
import { bookingExtras } from "@/db/sqlite/schema/bookings/booking-extras";
import { systemSettings } from "@/db/sqlite/schema/settings";
import { UserRoleEnum } from "@/db/sqlite/enums";
import { getMailService, renderAdminNewBookingEmail } from "@workspace/mail";
import { BUSINESS_INFO } from "@/constants/business-info";
import type { Env } from "@/types/env";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

/** Basic email validation - must have @ and domain */
function isValidEmail(email: string | null | undefined): boolean {
	if (!email || typeof email !== "string") return false;
	const trimmed = email.trim();
	if (trimmed.length < 5) return false;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Get system timezone from settings (cached)
 */
let cachedTimezone: string | null = null;
async function getSystemTimezone(): Promise<string> {
	if (cachedTimezone) return cachedTimezone;

	const settings = await db.select().from(systemSettings).limit(1);
	cachedTimezone = settings[0]?.timezone || "Australia/Sydney";
	return cachedTimezone;
}

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
	extras?: any;
}

/**
 * Get comprehensive booking details for email notifications
 */
async function getBookingDetailsForEmail(bookingId: string): Promise<BookingDetailsForEmail> {
	console.log(`📧 EMAIL SERVICE: Getting booking details for ${bookingId}`);

	// Get booking first
	const booking = await db
		.select()
		.from(bookings)
		.where(eq(bookings.id, bookingId))
		.get();

	if (!booking) {
		throw new Error(`Booking ${bookingId} not found`);
	}

	console.log(`📧 EMAIL SERVICE: Found booking, getting related data...`);

	// Get related data separately to avoid column limit issues
	const [driver, customer, car, packageData, stops, extras] = await Promise.all([
		// Get driver and driver user data
		booking.driverId ?
			db.select({
				driver: drivers,
				driverUser: users,
			})
			.from(drivers)
			.leftJoin(users, eq(drivers.userId, users.id))
			.where(eq(drivers.id, booking.driverId))
			.get() : null,

		// Get customer data (guest bookings have no userId - use booking's customer fields)
		booking.userId
			? db.select()
				.from(users)
				.where(eq(users.id, booking.userId))
				.get()
			: Promise.resolve(null),

		// Get car data
		booking.carId ?
			db.select()
				.from(cars)
				.where(eq(cars.id, booking.carId))
				.get() : null,

		// Get package data
		booking.packageId ?
			db.select()
				.from(packages)
				.where(eq(packages.id, booking.packageId))
				.get() : null,

		// Get booking stops
		db.select()
			.from(bookingStops)
			.where(eq(bookingStops.bookingId, bookingId))
			.orderBy(bookingStops.stopOrder),

		// Get booking extras
		db.select()
			.from(bookingExtras)
			.where(eq(bookingExtras.bookingId, bookingId))
			.get()
	]);

	console.log(`📧 EMAIL SERVICE: Retrieved all related data for booking ${bookingId}`);

	// For guest bookings (no userId), build customer from booking's customer fields
	const effectiveCustomer = customer ?? (booking.userId ? null : {
		name: booking.customerName,
		email: booking.customerEmail,
		phone: booking.customerPhone,
		phoneNumber: booking.customerPhone,
		timezone: booking.timezone,
	});

	return {
		booking,
		driver: driver?.driver || null,
		driverUser: driver?.driverUser || null,
		customer: effectiveCustomer,
		car,
		package: packageData,
		stops,
		extras,
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

	// Format pickup date and time using booking timezone or system default
	const pickupDateTime = booking.scheduledPickupTime || booking.pickupDateTime;
	const systemTimezone = "Australia/Sydney"; // Default system timezone
	const effectiveTimezone = booking.timezone || systemTimezone;
	const dateObj = new Date(pickupDateTime);
	const zonedDate = toZonedTime(dateObj, effectiveTimezone);
	const pickupDate = format(zonedDate, "EEEE, MMMM d, yyyy");
	const pickupTime = format(zonedDate, "h:mm a");

	// Build route information
	const pickupAddress = booking.originAddress || booking.pickupAddress;
	let routeInfo = `<strong>Pickup:</strong> ${pickupAddress}<br/>`;

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

	const destinationAddress = booking.destinationAddress;
	if (destinationAddress) {
		routeInfo += `<strong>Destination:</strong> ${destinationAddress}`;
	}

	// Service type and vehicle info
	const serviceType = pkg ? `Package Service: ${pkg.title}` : "Custom Booking";
	const vehicleInfo = car?.name || "Vehicle to be assigned";

	// Format booking reference for display - use reference number or last 6 digits of ID
	const bookingReference = booking.referenceNumber || "N/A";

	const subject = `New Booking Assignment - ${bookingReference}`;

	const websiteUrl = BUSINESS_INFO.business.websiteUrl;
	const customerName = customer?.name || booking.customerName || "Not provided";
	const customerEmail = customer?.email || booking.customerEmail || "Not provided";

	// Table-based layout for email client compatibility
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${subject}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:16px;line-height:1.6;color:#1e293b;background:#f8fafc;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
		<tr>
			<td style="padding:28px 32px;background:#22818e;text-align:center;">
				<h1 style="margin:0 0 4px 0;font-size:26px;font-weight:600;color:#fff;">New Booking Assignment</h1>
				<p style="margin:0;font-size:14px;color:rgba(255,255,255,0.9);">${BUSINESS_INFO.business.name}</p>
			</td>
		</tr>
		<tr>
			<td style="padding:32px;">
				<p style="margin:0 0 16px 0;font-size:17px;color:#334155;">Hello <strong>${driverName}</strong>,</p>
				<p style="margin:0 0 24px 0;font-size:15px;color:#64748b;line-height:1.6;">You have been assigned a new premium booking. Please review the details below.</p>

				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;border:1px solid #e2e8f0;border-radius:8px;border-collapse:collapse;background:#f8fafc;">
					<tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#0f172a;">Assignment Details</td></tr>
					<tr><td style="padding:16px 20px;">
						<p style="margin:0 0 8px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Booking Reference</p>
						<p style="margin:0 0 16px 0;font-size:16px;color:#22818e;font-weight:600;">${bookingReference}</p>
						<p style="margin:0 0 8px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Scheduled Pickup</p>
						<p style="margin:0;font-size:16px;color:#1e293b;">${pickupDate} at ${pickupTime}</p>
					</td></tr>
				</table>

				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;border:1px solid #e2e8f0;border-radius:8px;border-collapse:collapse;">
					<tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#0f172a;">Trip Information</td></tr>
					<tr><td style="padding:16px 20px;">
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Service</td></tr>
							<tr><td style="padding:0 0 16px 0;font-size:15px;color:#1e293b;">${serviceType}</td></tr>
							<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Vehicle</td></tr>
							<tr><td style="padding:0 0 16px 0;font-size:15px;color:#1e293b;">${vehicleInfo}</td></tr>
							${booking.passengerCount ? `<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Passengers</td></tr><tr><td style="padding:0 0 16px 0;font-size:15px;color:#1e293b;">${booking.passengerCount}</td></tr>` : ''}
							<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Route</td></tr>
							<tr><td style="padding:0 0 16px 0;font-size:15px;color:#1e293b;line-height:1.6;">${routeInfo}</td></tr>
							${booking.specialRequirements ? `<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Special Requirements</td></tr><tr><td style="padding:0;font-size:15px;color:#1e293b;">${booking.specialRequirements}</td></tr>` : ''}
						</table>
					</td></tr>
				</table>

				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;border:1px solid #e2e8f0;border-radius:8px;border-collapse:collapse;">
					<tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#0f172a;">Customer Information</td></tr>
					<tr><td style="padding:16px 20px;">
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Name</td></tr>
							<tr><td style="padding:0 0 16px 0;font-size:15px;color:#1e293b;">${customerName}</td></tr>
							<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Email</td></tr>
							<tr><td style="padding:0 0 16px 0;font-size:15px;color:#1e293b;">${customerEmail}</td></tr>
							${booking.customerPhone ? `<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Phone</td></tr><tr><td style="padding:0;font-size:15px;"><a href="tel:${booking.customerPhone}" style="color:#22818e;text-decoration:none;">${booking.customerPhone}</a></td></tr>` : ''}
						</table>
					</td></tr>
				</table>

				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
					<tr>
						<td style="padding:8px 8px 8px 0;">
							<a href="${websiteUrl}/driver" style="display:inline-block;padding:14px 28px;background:#22818e;color:#fff!important;text-decoration:none;font-weight:600;font-size:15px;border-radius:8px;">Driver Portal</a>
						</td>
						<td style="padding:8px 0 8px 8px;">
							<a href="${websiteUrl}/contact-us" style="display:inline-block;padding:14px 28px;background:#f1f5f9;color:#22818e!important;text-decoration:none;font-weight:600;font-size:15px;border-radius:8px;border:1px solid #e2e8f0;">Contact Support</a>
						</td>
					</tr>
				</table>
				<p style="margin:0;font-size:14px;color:#64748b;">Need help? Call <a href="${BUSINESS_INFO.phone.link}" style="color:#22818e;text-decoration:none;font-weight:600;">${BUSINESS_INFO.phone.display}</a></p>
			</td>
		</tr>
		<tr>
			<td style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
				<p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#475569;">${BUSINESS_INFO.business.name}</p>
				<p style="margin:0;font-size:12px;color:#94a3b8;">Automated notification · <a href="${websiteUrl}/contact-us" style="color:#22818e;text-decoration:none;">Contact Support</a></p>
			</td>
		</tr>
	</table>
</body>
</html>`;

	return { subject, html };
}

/**
 * Generate HTML template for trip status notification to customer
 */
function generateTripStatusEmailTemplate(
	status: string,
	bookingDetails: BookingDetailsForEmail
): { subject: string; html: string } {
	const { booking, driverUser, car, package: pkg, extras } = bookingDetails;

	// Format pickup date and time in booking timezone
	const pickupDateTime = booking.scheduledPickupTime || booking.pickupDateTime;
	const tz = booking.timezone || "Australia/Sydney";
	const zonedDate = toZonedTime(new Date(pickupDateTime), tz);
	const pickupDate = format(zonedDate, "EEEE, MMMM d, yyyy");
	const pickupTime = format(zonedDate, "h:mm a");

	// Status-specific content
	let statusTitle = "";
	let statusMessage = "";
	let statusIcon = "";

	switch (status) {
		case "confirmed":
			statusTitle = "Booking Confirmed";
			statusMessage = "Your booking has been confirmed. We will assign a driver and notify you soon.";
			statusIcon = "✅";
			break;
		case "driver_assigned":
			statusTitle = "Driver Assigned";
			statusMessage = "A driver has been assigned to your booking. They will be in touch closer to your pickup time.";
			statusIcon = "👤";
			break;
		case "driver_en_route":
			statusTitle = "Driver En Route to Pickup";
			statusMessage = "Your driver is now en route to your pickup location. Please be ready for pickup.";
			statusIcon = "🚗";
			break;
		case "arrived_pickup":
			statusTitle = "Driver Has Arrived at Pickup Location";
			statusMessage = "Your driver has arrived at your pickup location and is ready to begin your trip.";
			statusIcon = "📍";
			break;
		case "in_progress":
		case "passenger_on_board":
			statusTitle = "Trip in Progress";
			statusMessage = "Your trip has started and you are now en route to your destination.";
			statusIcon = "🚙";
			break;
		case "dropped_off":
			statusTitle = "Dropped Off at Destination";
			statusMessage = "You have been safely dropped off at your destination. Your trip is nearly complete.";
			statusIcon = "🏁";
			break;
		case "completed":
			statusTitle = "Trip Completed";
			statusMessage = `Your trip has been completed successfully. Thank you for choosing ${BUSINESS_INFO.business.name}!`;
			statusIcon = "✅";
			break;
		case "cancelled":
			statusTitle = "Booking Cancelled";
			statusMessage = "Your booking has been cancelled. If you have any questions, please contact us.";
			statusIcon = "❌";
			break;
		case "no_show":
			statusTitle = "No Show Recorded";
			statusMessage = "Our driver was unable to locate you at the pickup location. Please contact us if there was an issue.";
			statusIcon = "⚠️";
			break;
		default:
			statusTitle = "Booking Status Update";
			statusMessage = "Your booking status has been updated.";
			statusIcon = "📋";
	}

	const serviceType = pkg?.title || "Custom Trip";
	const vehicleInfo = car?.name || "Assigned Vehicle";
	const driverName = driverUser?.name || "Your Driver";

	// Format booking reference for display - use reference number or last 6 digits of ID
	const bookingReference = booking.referenceNumber || "N/A";

	const subject = `${statusTitle} - Booking #${bookingReference}`;

	// Website base URL
	const websiteUrl = "https://downunderchauffeurs.com";

	// Convert oklch colors to standard CSS
	const colors = {
		primary: '#22818e', // oklch(0.45 0.08 180) converted
		primaryLight: '#86d6e5', // oklch(0.75 0.18 180) converted
		background: '#ffffff', // oklch(1 0 0)
		foreground: '#3c3c3c', // oklch(0.235 0 0)
		beige: '#f7f2ee', // oklch(0.9404 0.0446 107.23)
		softBeige: '#faf8f5', // oklch(0.9726 0.0132 111.27)
		card: '#fefdf9', // oklch(0.98 0.01 85)
		muted: '#e8e3db', // oklch(0.9 0.02 85)
		mutedForeground: '#737373', // oklch(0.45 0 0)
		border: '#d4cabe' // oklch(0.85 0.02 85)
	};

	// Table-based layout for email client compatibility (Gmail, Outlook, etc.)
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${subject}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:16px;line-height:1.6;color:#1e293b;background:#f8fafc;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
		<!-- Header: Brand teal -->
		<tr>
			<td style="padding:28px 32px;background:#22818e;text-align:center;">
				<h1 style="margin:0 0 4px 0;font-size:26px;font-weight:600;color:#fff;letter-spacing:-0.5px;">${BUSINESS_INFO.business.name}</h1>
				<p style="margin:0;font-size:14px;color:rgba(255,255,255,0.9);">
					${statusTitle} ${statusIcon}
				</p>
			</td>
		</tr>
		<!-- Content -->
		<tr>
			<td style="padding:32px;">
				<p style="margin:0 0 24px 0;font-size:17px;color:#334155;line-height:1.6;">${statusMessage}</p>
				<p style="margin:0 0 28px 0;font-size:14px;color:#64748b;">Booking reference: <strong style="color:#22818e;">${bookingReference}</strong></p>

				<!-- Trip Details -->
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;border:1px solid #e2e8f0;border-radius:8px;border-collapse:collapse;">
					<tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#0f172a;">Trip Details</td></tr>
					<tr><td style="padding:16px 20px;border-bottom:1px solid #f1f5f9;">
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Service</td></tr>
							<tr><td style="padding:0 0 16px 0;font-size:15px;color:#1e293b;">${serviceType}</td></tr>
							<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Pickup</td></tr>
							<tr><td style="padding:0 0 16px 0;font-size:15px;color:#1e293b;">${pickupDate} at ${pickupTime}</td></tr>
							<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">From</td></tr>
							<tr><td style="padding:0 0 16px 0;font-size:15px;color:#1e293b;">${booking.originAddress || booking.pickupAddress}</td></tr>
							${booking.destinationAddress ? `
							<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">To</td></tr>
							<tr><td style="padding:0 0 16px 0;font-size:15px;color:#1e293b;">${booking.destinationAddress}</td></tr>
							` : ''}
						</table>
					</td></tr>
				</table>

				<!-- Service Team -->
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;border:1px solid #e2e8f0;border-radius:8px;border-collapse:collapse;">
					<tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#0f172a;">Service Team</td></tr>
					<tr><td style="padding:16px 20px;">
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
							<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Driver</td></tr>
							<tr><td style="padding:0 0 16px 0;font-size:15px;color:#1e293b;">${driverName}</td></tr>
							<tr><td style="padding:8px 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Vehicle</td></tr>
							<tr><td style="padding:0;font-size:15px;color:#1e293b;">${vehicleInfo}</td></tr>
						</table>
					</td></tr>
				</table>

				${status === "completed" ? `
				<!-- Fare Breakdown -->
				${(() => {
					const tollCharges = extras?.tollCharges ?? 0;
					const parkingCharges = extras?.parkingCharges ?? 0;
					const otherCharges = extras?.otherChargesAmount ?? 0;
					const extraChargesTotal = booking.extraCharges ?? 0;
					const waitingTimeCharge = Math.max(0, extraChargesTotal - tollCharges - parkingCharges - otherCharges);
					const baseAmount = ((booking.baseFare ?? 0) + (booking.distanceFare ?? 0)) || (booking.quotedAmount ?? 0);
					const finalAmount = booking.finalAmount ?? ((booking.quotedAmount ?? 0) + (booking.extraCharges ?? 0));
					const hasBreakdown = tollCharges > 0 || parkingCharges > 0 || waitingTimeCharge > 0 || otherCharges > 0;
					if (!hasBreakdown && extraChargesTotal <= 0) {
						return `
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;border:1px solid #e2e8f0;border-radius:8px;border-collapse:collapse;">
					<tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#0f172a;">Fare Summary</td></tr>
					<tr><td style="padding:16px 20px;">
						<div style="display:flex;justify-content:space-between;font-size:15px;color:#1e293b;">
							<span>Total charged:</span>
							<span style="font-weight:600;">$${finalAmount.toFixed(2)}</span>
						</div>
					</td></tr>
				</table>`;
					}
					return `
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;border:1px solid #e2e8f0;border-radius:8px;border-collapse:collapse;">
					<tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#0f172a;">Fare Breakdown</td></tr>
					<tr><td style="padding:16px 20px;">
						<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#334155;">
							${baseAmount > 0 ? `<tr><td style="padding:6px 0;">Trip fare</td><td style="padding:6px 0;text-align:right;">$${baseAmount.toFixed(2)}</td></tr>` : ''}
							${tollCharges > 0 ? `<tr><td style="padding:6px 0;">Tolls</td><td style="padding:6px 0;text-align:right;">$${tollCharges.toFixed(2)}</td></tr>` : ''}
							${parkingCharges > 0 ? `<tr><td style="padding:6px 0;">Parking</td><td style="padding:6px 0;text-align:right;">$${parkingCharges.toFixed(2)}</td></tr>` : ''}
							${waitingTimeCharge > 0 ? `<tr><td style="padding:6px 0;">Waiting time</td><td style="padding:6px 0;text-align:right;">$${waitingTimeCharge.toFixed(2)}</td></tr>` : ''}
							${otherCharges > 0 ? `<tr><td style="padding:6px 0;">Other charges</td><td style="padding:6px 0;text-align:right;">$${otherCharges.toFixed(2)}</td></tr>` : ''}
							<tr><td style="padding:12px 0 0 0;font-weight:600;color:#0f172a;">Total charged</td><td style="padding:12px 0 0 0;text-align:right;font-weight:600;color:#0f172a;">$${finalAmount.toFixed(2)}</td></tr>
						</table>
					</td></tr>
				</table>`;
				})()}
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;border:1px solid #86efac;border-radius:8px;background:#f0fdf4;">
					<tr><td style="padding:20px;text-align:center;font-size:16px;color:#166534;">Thank you for choosing ${BUSINESS_INFO.business.name}. We hope you enjoyed your luxury travel experience.</td></tr>
				</table>
				` : ''}

				<!-- CTA Buttons -->
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
					<tr>
						<td style="padding:8px 8px 8px 0;">
							<a href="${websiteUrl}/my-bookings" style="display:inline-block;padding:14px 28px;background:#22818e;color:#fff!important;text-decoration:none;font-weight:600;font-size:15px;border-radius:8px;">View My Bookings</a>
						</td>
						<td style="padding:8px 0 8px 8px;">
							<a href="${websiteUrl}/contact-us" style="display:inline-block;padding:14px 28px;background:#f1f5f9;color:#22818e!important;text-decoration:none;font-weight:600;font-size:15px;border-radius:8px;border:1px solid #e2e8f0;">Contact Support</a>
						</td>
					</tr>
				</table>
				<p style="margin:0;font-size:14px;color:#64748b;">Need help? Call <a href="${BUSINESS_INFO.phone.link}" style="color:#22818e;text-decoration:none;font-weight:600;">${BUSINESS_INFO.phone.display}</a></p>
			</td>
		</tr>
		<!-- Footer -->
		<tr>
			<td style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
				<p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#475569;">${BUSINESS_INFO.business.name}</p>
				<p style="margin:0 0 12px 0;font-size:12px;color:#94a3b8;">Premium Luxury Transportation Services</p>
				<p style="margin:0;font-size:12px;color:#94a3b8;">Automated notification · <a href="${websiteUrl}/contact-us" style="color:#22818e;text-decoration:none;">Contact Support</a></p>
			</td>
		</tr>
	</table>
</body>
</html>`;

	return { subject, html };
}

/**
 * Send driver assignment notification email
 * Duplicate prevention: skips if already sent to this driver (allows resend on driver reassignment)
 */
export async function sendDriverAssignmentNotification(data: DriverAssignmentEmailData): Promise<{ success: boolean; message: string }> {
	try {
		const { bookingId, driverId, env } = data;
		console.log(`📧 EMAIL SERVICE: Starting driver assignment notification for booking ${bookingId}, driver ${driverId}`);

		if (!env) {
			console.error(`❌ DRIVER ASSIGNMENT: env is missing - check tRPC context passes env`);
			return { success: false, message: "Environment not available" };
		}

		// Get booking details
		console.log(`📧 EMAIL SERVICE: Fetching booking details for booking ${bookingId}`);
		const bookingDetails = await getBookingDetailsForEmail(bookingId);
		const { booking, driverUser, car, package: pkg, stops, customer } = bookingDetails;
		console.log(`📧 EMAIL SERVICE: Booking details fetched. Driver user email: ${driverUser?.email}`);

		if (!isValidEmail(driverUser?.email)) {
			console.log(`❌ EMAIL SERVICE: No valid driver email for driver ${driverId}`);
			return { success: false, message: "Driver email not found or invalid" };
		}

		// Duplicate prevention - skip if already sent to this driver (allows resend when driver is reassigned)
		if (booking.driverAssignmentEmailSentToDriverId === driverId) {
			console.log(`⏭️ EMAIL SERVICE: Skipping - driver assignment email already sent to driver ${driverId}`);
			return { success: true, message: "Driver assignment email already sent to this driver" };
		}

		const driverName = driverUser.name || "Driver";
		// Use plain HTML template (works in Cloudflare Workers - no React)
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

		// Mark as sent (duplicate prevention, track which driver) - run migration 0015 if this fails
		try {
			await db.update(bookings).set({
				driverAssignmentEmailSentAt: new Date(),
				driverAssignmentEmailSentToDriverId: driverId,
				updatedAt: new Date(),
			}).where(eq(bookings.id, bookingId));
		} catch (dbErr) {
			console.warn(`⚠️ DRIVER ASSIGNMENT: Could not update driverAssignmentEmailSentAt (run migration 0015):`, dbErr);
		}

		return {
			success: true,
			message: `Driver assignment notification sent to ${driverUser.email}`,
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
 * Send trip status / job completion summary email to customer (registered user or guest)
 * For status=completed: duplicate prevention via completionSummaryEmailSentAt
 */
export async function sendTripStatusNotification(data: TripStatusEmailData): Promise<{ success: boolean; message: string }> {
	try {
		const { bookingId, status, env } = data;
		console.log(`📧 TRIP EMAIL DEBUG: sendTripStatusNotification called for booking ${bookingId}, status: ${status}`);

		if (!env) {
			console.error(`❌ TRIP EMAIL: env is missing - check tRPC context passes env`);
			return { success: false, message: "Environment not available" };
		}

		// Get booking details (includes guest support)
		const bookingDetails = await getBookingDetailsForEmail(bookingId);
		const { booking, customer } = bookingDetails;

		const recipientEmail = customer?.email || booking.customerEmail;
		if (!isValidEmail(recipientEmail)) {
			console.log(`⏭️ TRIP EMAIL: Skipping - no valid customer email for booking ${bookingId}`);
			return { success: false, message: "No valid customer email" };
		}

		// For completion summary: duplicate prevention
		if (status === "completed") {
			if (booking.completionSummaryEmailSentAt) {
				console.log(`⏭️ TRIP EMAIL: Skipping - completion summary already sent for booking ${bookingId}`);
				return { success: true, message: "Completion summary email already sent" };
			}
		}

		// Use plain HTML template (works in Cloudflare Workers - no React)
		const template = generateTripStatusEmailTemplate(status, bookingDetails);

		// Send email
		console.log(`📧 TRIP EMAIL DEBUG: Getting mail service and sending email to ${recipientEmail}`);
		const mailService = getMailService(env);
		const success = await mailService.sendEmail({
			to: recipientEmail,
			subject: template.subject,
			html: template.html,
		});
		console.log(`📧 TRIP EMAIL DEBUG: Email send result: ${success}`);

		if (!success) {
			throw new Error("Failed to send trip status email");
		}

		// For completion summary: mark as sent (duplicate prevention)
		if (status === "completed") {
			try {
				await db.update(bookings).set({
					completionSummaryEmailSentAt: new Date(),
					updatedAt: new Date(),
				}).where(eq(bookings.id, bookingId));
			} catch (dbErr) {
				console.warn(`⚠️ TRIP EMAIL: Could not update completionSummaryEmailSentAt (run migration 0015):`, dbErr);
			}
		}

		return {
			success: true,
			message: `Trip status notification sent to ${recipientEmail}`,
		};
	} catch (error) {
		console.error("Error sending trip status notification:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}
/**
 * Send booking confirmation email to customer (registered user or guest)
 * Duplicate prevention: skips if confirmationEmailSentAt is already set
 */
export async function sendBookingConfirmationEmail(bookingId: string, env: Env) {
	try {
		console.log(`📧 BOOKING CONFIRMATION: Starting email for booking ${bookingId}`);

		if (!env) {
			console.error(`❌ BOOKING CONFIRMATION: env is missing - check tRPC context passes env`);
			return { success: false, message: "Environment not available" };
		}

		// Get booking details (includes guest support via effectiveCustomer)
		const bookingDetails = await getBookingDetailsForEmail(bookingId);
		const { booking, customer } = bookingDetails;

		const recipientEmail = customer?.email || booking.customerEmail;
		if (!isValidEmail(recipientEmail)) {
			console.log(`⏭️ BOOKING CONFIRMATION: Skipping - no valid customer email for booking ${bookingId}`);
			return { success: false, message: "No valid customer email" };
		}

		// Duplicate prevention
		if (booking.confirmationEmailSentAt) {
			console.log(`⏭️ BOOKING CONFIRMATION: Skipping - already sent at ${booking.confirmationEmailSentAt}`);
			return { success: true, message: "Confirmation email already sent" };
		}

		// Use plain HTML template (works in Cloudflare Workers - no React)
		const template = generateTripStatusEmailTemplate("confirmed", bookingDetails);

		// Send email
		console.log(`📧 BOOKING CONFIRMATION: Sending email to ${recipientEmail}`);
		const mailService = getMailService(env);
		const success = await mailService.sendEmail({
			to: recipientEmail,
			subject: template.subject,
			html: template.html,
		});
		console.log(`📧 BOOKING CONFIRMATION: Email send result: ${success}`);

		if (!success) {
			throw new Error("Failed to send booking confirmation email");
		}

		// Mark as sent (duplicate prevention) - run migration 0015 if this fails
		try {
			await db.update(bookings).set({
				confirmationEmailSentAt: new Date(),
				updatedAt: new Date(),
			}).where(eq(bookings.id, bookingId));
		} catch (dbErr) {
			console.warn(`⚠️ BOOKING CONFIRMATION: Could not update confirmationEmailSentAt (run migration 0015):`, dbErr);
		}

		return {
			success: true,
			message: `Booking confirmation sent to ${recipientEmail}`,
		};
	} catch (error) {
		console.error("Error sending booking confirmation:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

/**
 * Send new booking notification to admin
 */
export async function sendAdminNewBookingEmail(bookingId: string, env: Env) {
	try {
		console.log(`📧 ADMIN NOTIFICATION: Starting email for new booking ${bookingId}`);

		// Get booking details
		const bookingDetails = await getBookingDetailsForEmail(bookingId);

		if (!bookingDetails.customer || !bookingDetails.customer.email) {
			throw new Error("Customer information not found");
		}

		const { booking, customer, car, package: pkg, stops } = bookingDetails;

		// Format pickup date and time
		// Display time in UTC (as stored) without timezone conversion
		const pickupDateTime = booking.scheduledPickupTime || booking.pickupDateTime;
		// Format pickup date and time using booking's timezone
		const userTimezone = booking.timezone || "Australia/Sydney"; // Default to Sydney if not set
		const dateObj = new Date(pickupDateTime);
		const zonedDate = toZonedTime(dateObj, userTimezone);
		const pickupDate = format(zonedDate, "EEEE, MMMM d, yyyy");
		const pickupTime = format(zonedDate, "h:mm a");

		// Determine service type
		let serviceType = "Custom Booking";
		if (booking.bookingType === "package" && pkg) {
			serviceType = `Package: ${pkg.name}`;
		} else if (booking.bookingType === "car") {
			serviceType = "Car Rental";
		}

		// Get vehicle info
		let vehicleInfo = "Luxury Vehicle";
		if (car) {
			vehicleInfo = car.name || "Luxury Vehicle";
		}

		// Generate booking reference
		const bookingReference = booking.referenceNumber || "N/A";

		// Get all admin and super_admin users
		const adminUsers = await db.select()
			.from(users)
			.where(
				or(
					eq(users.role, UserRoleEnum.Admin),
					eq(users.role, UserRoleEnum.SuperAdmin)
				)
			);

		if (!adminUsers || adminUsers.length === 0) {
			console.log("⚠️ No admin users found, skipping admin notification");
			return {
				success: false,
				message: "No admin users found to notify",
			};
		}

		console.log(`📧 ADMIN NOTIFICATION: Found ${adminUsers.length} admin users`);

		// Generate email template
		const template = await renderAdminNewBookingEmail({
			customerName: customer.name || "Customer",
			customerEmail: customer.email,
			customerPhone: customer.phoneNumber,
			bookingReference,
			serviceType,
			pickupDate,
			pickupTime,
			originAddress: booking.originAddress || booking.pickupAddress,
			destinationAddress: booking.destinationAddress,
			vehicleInfo,
			websiteUrl: "https://downunderchauffeurs.com",
			stops: stops?.map(stop => ({ address: stop.address })) || [],
			passengerCount: booking.passengerCount || 1,
			luggageCount: booking.luggageCount || 0,
			specialRequests: booking.specialRequests,
			quotedAmount: booking.quotedAmount,
		});

		// Send email to all admins
		const mailService = getMailService(env);
		const emailResults = await Promise.allSettled(
			adminUsers.map(admin => {
				console.log(`📧 ADMIN NOTIFICATION: Sending email to ${admin.email}`);
				return mailService.sendEmail({
					to: admin.email,
					subject: template.subject,
					html: template.html,
				});
			})
		);

		const successCount = emailResults.filter(result => result.status === 'fulfilled' && result.value).length;
		const failureCount = emailResults.length - successCount;

		console.log(`📧 ADMIN NOTIFICATION: Sent to ${successCount}/${adminUsers.length} admins (${failureCount} failed)`);

		return {
			success: successCount > 0,
			message: `Admin notifications sent to ${successCount}/${adminUsers.length} admins`,
		};
	} catch (error) {
		console.error("Error sending admin notification:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}
