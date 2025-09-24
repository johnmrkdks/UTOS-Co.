import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/sqlite/schema/bookings";
import { drivers } from "@/db/sqlite/schema/drivers";
import { users } from "@/db/sqlite/schema/users";
import { cars } from "@/db/sqlite/schema/cars";
import { packages } from "@/db/sqlite/schema/packages";
import { bookingStops } from "@/db/sqlite/schema/bookings/booking-stops";
import { getMailService, renderTripStatusEmail, renderDriverAssignmentEmail } from "@workspace/mail";
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
	const [driver, customer, car, packageData, stops] = await Promise.all([
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

		// Get customer data
		db.select()
			.from(users)
			.where(eq(users.id, booking.userId))
			.get(),

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
			.orderBy(bookingStops.stopOrder)
	]);

	console.log(`📧 EMAIL SERVICE: Retrieved all related data for booking ${bookingId}`);

	return {
		booking,
		driver: driver?.driver || null,
		driverUser: driver?.driverUser || null,
		customer,
		car,
		package: packageData,
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

	// Format pickup date and time - use scheduledPickupTime field
	const pickupDateTime = booking.scheduledPickupTime || booking.pickupDateTime;
	const pickupDate = new Date(pickupDateTime).toLocaleDateString("en-AU", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const pickupTime = new Date(pickupDateTime).toLocaleTimeString("en-AU", {
		hour: "2-digit",
		minute: "2-digit",
	});

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
	const vehicleInfo = car ? `${car.brand} ${car.model} (${car.category})` : "Vehicle to be assigned";

	// Format booking reference for display - use reference number or last 6 digits of ID
	const bookingReference = booking.referenceNumber || booking.id.slice(-6).toUpperCase();

	const subject = `New Booking Assignment - ${bookingReference}`;

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
		warmBeige: '#f5f0eb', // oklch(0.9373 0.0283 111.44)
		darkBeige: '#e8ddd4', // oklch(0.8736 0.0344 111.97)
	};

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${subject}</title>
	<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
	<style>
		body {
			font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			margin: 0;
			padding: 20px;
			background: linear-gradient(135deg, ${colors.beige} 0%, ${colors.softBeige} 100%);
			color: ${colors.foreground};
			line-height: 1.6;
		}

		.email-container {
			max-width: 650px;
			margin: 0 auto;
			background: ${colors.background};
			border-radius: 24px;
			overflow: hidden;
			box-shadow:
				0 25px 50px -12px rgba(0, 0, 0, 0.15),
				0 0 0 1px rgba(34, 129, 142, 0.1);
		}

		.header {
			background: linear-gradient(135deg, ${colors.primary} 0%, #1a6e78 100%);
			padding: 50px 40px;
			text-align: center;
			position: relative;
		}

		.header::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 6px;
			background: linear-gradient(90deg, ${colors.primaryLight} 0%, ${colors.primary} 50%, #1a6e78 100%);
		}

		.header-title {
			font-family: 'Playfair Display', Georgia, serif;
			font-size: 36px;
			font-weight: 600;
			color: white;
			margin: 0 0 8px 0;
			letter-spacing: -0.5px;
		}

		.header-subtitle {
			font-size: 18px;
			color: rgba(255, 255, 255, 0.9);
			margin: 0;
			font-weight: 300;
		}

		.content {
			padding: 50px 40px;
			background: ${colors.background};
		}

		.greeting {
			font-size: 20px;
			margin-bottom: 16px;
			color: ${colors.foreground};
		}

		.intro-text {
			font-size: 16px;
			color: #64748b;
			margin-bottom: 40px;
			line-height: 1.7;
		}

		.assignment-highlight {
			background: linear-gradient(135deg, ${colors.softBeige} 0%, ${colors.warmBeige} 100%);
			border: 2px solid ${colors.primary};
			border-radius: 20px;
			padding: 40px;
			margin: 40px 0;
			text-align: center;
			position: relative;
		}

		.assignment-highlight::before {
			content: '✓';
			position: absolute;
			top: -15px;
			left: 50%;
			transform: translateX(-50%);
			background: ${colors.primary};
			color: white;
			width: 30px;
			height: 30px;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
			font-size: 16px;
		}

		.assignment-title {
			font-family: 'Playfair Display', Georgia, serif;
			font-size: 28px;
			font-weight: 600;
			color: ${colors.primary};
			margin: 0 0 20px 0;
		}

		.booking-ref {
			font-size: 18px;
			color: ${colors.foreground};
			margin: 12px 0;
		}

		.pickup-datetime {
			font-size: 20px;
			color: ${colors.primary};
			font-weight: 600;
			margin: 16px 0;
		}

		.section-card {
			background: ${colors.softBeige};
			border-radius: 16px;
			padding: 32px;
			margin: 32px 0;
			border-left: 6px solid ${colors.primary};
		}

		.section-title {
			font-family: 'Playfair Display', Georgia, serif;
			font-size: 24px;
			font-weight: 600;
			color: ${colors.primary};
			margin: 0 0 24px 0;
		}

		.detail-grid {
			display: grid;
			gap: 16px;
		}

		.detail-row {
			display: flex;
			padding: 12px 0;
			border-bottom: 1px solid rgba(34, 129, 142, 0.1);
		}

		.detail-row:last-child {
			border-bottom: none;
		}

		.detail-label {
			font-weight: 600;
			color: #475569;
			min-width: 140px;
			flex-shrink: 0;
		}

		.detail-value {
			color: ${colors.foreground};
			flex: 1;
		}

		.route-info {
			background: white;
			padding: 20px;
			border-radius: 12px;
			margin-top: 16px;
			border: 1px solid rgba(34, 129, 142, 0.15);
		}

		.next-steps {
			background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
			border: 2px solid #f59e0b;
			border-radius: 16px;
			padding: 32px;
			margin: 40px 0;
		}

		.next-steps-title {
			font-family: 'Playfair Display', Georgia, serif;
			font-size: 22px;
			font-weight: 600;
			color: #b45309;
			margin: 0 0 20px 0;
		}

		.steps-list {
			margin: 0;
			padding-left: 20px;
			color: #b45309;
		}

		.steps-list li {
			margin-bottom: 8px;
			line-height: 1.6;
		}

		.cta-container {
			text-align: center;
			margin: 50px 0;
		}

		.cta-button {
			display: inline-block;
			background: linear-gradient(135deg, ${colors.primary} 0%, #1a6e78 100%);
			color: white;
			padding: 18px 36px;
			text-decoration: none;
			border-radius: 12px;
			font-weight: 600;
			font-size: 16px;
			margin: 8px 12px;
			box-shadow:
				0 8px 25px rgba(34, 129, 142, 0.3),
				0 2px 6px rgba(34, 129, 142, 0.2);
			transition: all 0.3s ease;
		}

		.cta-button:hover {
			transform: translateY(-2px);
			box-shadow:
				0 12px 35px rgba(34, 129, 142, 0.4),
				0 4px 12px rgba(34, 129, 142, 0.3);
		}

		.contact-info {
			text-align: center;
			padding: 24px;
			background: rgba(34, 129, 142, 0.05);
			border-radius: 12px;
			margin: 32px 0;
		}

		.contact-info p {
			margin: 8px 0;
			color: #64748b;
		}

		.contact-info a {
			color: ${colors.primary};
			text-decoration: none;
			font-weight: 500;
		}

		.footer {
			background: linear-gradient(135deg, ${colors.beige} 0%, ${colors.darkBeige} 100%);
			padding: 40px;
			text-align: center;
			border-top: 1px solid rgba(34, 129, 142, 0.1);
		}

		.footer-brand {
			font-family: 'Playfair Display', Georgia, serif;
			font-size: 24px;
			font-weight: 600;
			color: ${colors.primary};
			margin: 0 0 8px 0;
		}

		.footer-tagline {
			font-size: 16px;
			color: #64748b;
			margin: 0 0 24px 0;
			font-weight: 300;
		}

		.footer-links {
			margin: 20px 0;
		}

		.footer-links a {
			color: ${colors.primary};
			text-decoration: none;
			font-weight: 500;
			margin: 0 8px;
		}

		.footer-links a:hover {
			text-decoration: underline;
		}

		.footer-disclaimer {
			font-size: 14px;
			color: #94a3b8;
			margin-top: 24px;
			line-height: 1.5;
		}

		/* Dark mode support */
		@media (prefers-color-scheme: dark) {
			.email-container {
				background: #1e293b;
				color: #e2e8f0;
			}

			.content {
				background: #1e293b;
			}

			.section-card {
				background: #334155;
			}

			.route-info {
				background: #475569;
				border-color: rgba(134, 214, 229, 0.3);
			}

			.detail-row {
				border-bottom-color: rgba(134, 214, 229, 0.2);
			}

			.detail-value {
				color: #e2e8f0;
			}

			.contact-info {
				background: rgba(134, 214, 229, 0.1);
			}
		}

		/* Mobile responsiveness */
		@media (max-width: 600px) {
			body {
				padding: 10px;
			}

			.email-container {
				border-radius: 16px;
			}

			.header {
				padding: 30px 20px;
			}

			.header-title {
				font-size: 28px;
			}

			.content {
				padding: 30px 20px;
			}

			.assignment-highlight, .section-card, .next-steps {
				padding: 24px 20px;
			}

			.detail-row {
				flex-direction: column;
			}

			.detail-label {
				min-width: auto;
				margin-bottom: 4px;
				font-size: 14px;
			}

			.cta-button {
				display: block;
				margin: 12px auto;
				width: fit-content;
			}
		}
	</style>
</head>
<body>
	<div class="email-container">
		<div class="header">
			<h1 class="header-title">New Booking Assignment</h1>
			<p class="header-subtitle">Down Under Chauffeurs</p>
		</div>

		<div class="content">
			<p class="greeting">Hello <strong>${driverName}</strong>,</p>
			<p class="intro-text">You have been assigned a new premium booking. Please review the details below and confirm your availability through the driver portal.</p>

			<div class="assignment-highlight">
				<h2 class="assignment-title">Assignment Details</h2>
				<p class="booking-ref"><strong>Booking Reference:</strong> ${bookingReference}</p>
				<p class="pickup-datetime"><strong>Scheduled Pickup:</strong> ${pickupDate} at ${pickupTime}</p>
			</div>

			<div class="section-card">
				<h3 class="section-title">Trip Information</h3>
				<div class="detail-grid">
					<div class="detail-row">
						<span class="detail-label">Service Type:</span>
						<span class="detail-value">${serviceType}</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">Vehicle:</span>
						<span class="detail-value">${vehicleInfo}</span>
					</div>
					${booking.passengerCount ? `
					<div class="detail-row">
						<span class="detail-label">Passengers:</span>
						<span class="detail-value">${booking.passengerCount}</span>
					</div>
					` : ''}
					<div class="detail-row">
						<span class="detail-label">Route:</span>
						<div class="detail-value">
							<div class="route-info">${routeInfo}</div>
						</div>
					</div>
					${booking.specialRequirements ? `
					<div class="detail-row">
						<span class="detail-label">Special Requirements:</span>
						<span class="detail-value">${booking.specialRequirements}</span>
					</div>
					` : ''}
				</div>
			</div>

			<div class="section-card">
				<h3 class="section-title">Customer Information</h3>
				<div class="detail-grid">
					<div class="detail-row">
						<span class="detail-label">Name:</span>
						<span class="detail-value">${customer?.name || booking.customerName || 'Not provided'}</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">Email:</span>
						<span class="detail-value">${customer?.email || booking.customerEmail || 'Not provided'}</span>
					</div>
					${booking.customerPhone ? `
					<div class="detail-row">
						<span class="detail-label">Phone:</span>
						<span class="detail-value"><a href="tel:${booking.customerPhone}" style="color: ${colors.primary}; text-decoration: none;">${booking.customerPhone}</a></span>
					</div>
					` : ''}
					${booking.specialRequests ? `
					<div class="detail-row">
						<span class="detail-label">Special Requests:</span>
						<span class="detail-value">${booking.specialRequests}</span>
					</div>
					` : ''}
				</div>
			</div>

			<div class="next-steps">
				<h3 class="next-steps-title">Next Steps</h3>
				<ol class="steps-list">
					<li>Review all trip details carefully</li>
					<li>Log into your driver portal to accept or decline this assignment</li>
					<li>Contact the customer if you have any questions</li>
					<li>Arrive at the pickup location punctually</li>
					<li>Provide exceptional luxury service throughout the journey</li>
				</ol>
			</div>

			<div class="cta-container">
				<a href="${websiteUrl}/driver" class="cta-button">Driver Portal</a>
				<a href="${websiteUrl}/contact-us" class="cta-button">Contact Support</a>
			</div>

			<div class="contact-info">
				<p><strong>Need immediate assistance?</strong></p>
				<p>Call us at <a href="tel:+61-XXX-XXX-XXX">+61 XXX XXX XXX</a></p>
				<p>Or email us at <a href="mailto:support@downunderchauffeurs.com">support@downunderchauffeurs.com</a></p>
			</div>
		</div>

		<div class="footer">
			<h3 class="footer-brand">Down Under Chauffeurs</h3>
			<p class="footer-tagline">Premium Luxury Transportation Services</p>

			<div class="footer-links">
				<a href="${websiteUrl}">Visit Website</a>
				<span style="color: #94a3b8;">|</span>
				<a href="${websiteUrl}/services">Our Services</a>
				<span style="color: #94a3b8;">|</span>
				<a href="${websiteUrl}/contact-us">Contact Us</a>
			</div>

			<p class="footer-disclaimer">
				This is an automated notification from Down Under Chauffeurs.<br>
				For support or questions, please contact our customer service team.
			</p>
		</div>
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

	// Format pickup date and time - use scheduledPickupTime field
	const pickupDateTime = booking.scheduledPickupTime || booking.pickupDateTime;
	const pickupDate = new Date(pickupDateTime).toLocaleDateString("en-AU", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const pickupTime = new Date(pickupDateTime).toLocaleTimeString("en-AU", {
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
			statusTitle = "Your Trip Has Started";
			statusMessage = "Your driver has started your trip and is now en route to your destination. You should be on your way!";
			statusIcon = "🚗";
			break;
		case "arrived_pickup":
			statusTitle = "Driver Has Arrived at Destination";
			statusMessage = "Your driver has arrived at your destination. Your trip is now complete.";
			statusIcon = "📍";
			break;
		case "completed":
			statusTitle = "Trip Completed";
			statusMessage = "Your trip has been completed successfully. Thank you for choosing Down Under Chauffeurs!";
			statusIcon = "✅";
			break;
		default:
			statusTitle = "Booking Status Update";
			statusMessage = "Your booking status has been updated.";
			statusIcon = "📋";
	}

	const serviceType = pkg?.title || "Custom Trip";
	const vehicleInfo = car ? `${car.brand} ${car.model}` : "Assigned Vehicle";
	const driverName = driverUser?.name || "Your Driver";

	// Format booking reference for display - use reference number or last 6 digits of ID
	const bookingReference = booking.referenceNumber || booking.id.slice(-6).toUpperCase();

	const subject = `${statusTitle} - Booking ${bookingReference}`;

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

	const html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>${subject}</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
			<style>
				* {
					box-sizing: border-box;
				}
				body {
					font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
					font-size: 16px;
					line-height: 1.7;
					color: ${colors.foreground};
					margin: 0;
					padding: 20px;
					background: linear-gradient(135deg, ${colors.beige} 0%, ${colors.softBeige} 100%);
					min-height: 100vh;
				}

				.email-wrapper {
					max-width: 650px;
					margin: 0 auto;
					background: ${colors.background};
					border-radius: 16px;
					overflow: hidden;
					box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);
				}

				.header {
					background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
					color: white;
					padding: 50px 40px 40px;
					text-align: center;
					position: relative;
				}

				.header::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					height: 3px;
					background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 100%);
				}

				.logo {
					max-width: 200px;
					height: auto;
					margin-bottom: 30px;
					filter: brightness(0) invert(1);
				}

				.header-title {
					font-family: 'Playfair Display', Georgia, serif;
					font-size: 36px;
					font-weight: 600;
					margin: 0 0 8px 0;
					letter-spacing: -0.5px;
					line-height: 1.2;
				}

				.header-subtitle {
					font-family: 'Inter', sans-serif;
					font-size: 16px;
					font-weight: 300;
					margin: 0;
					opacity: 0.85;
					letter-spacing: 0.5px;
				}

				.content {
					padding: 50px 40px;
					background: ${colors.background};
				}

				.status-section {
					text-align: center;
					margin-bottom: 40px;
					padding: 40px 30px;
					background: linear-gradient(135deg, ${colors.softBeige} 0%, ${colors.card} 100%);
					border-radius: 12px;
					border: 1px solid ${colors.border};
				}

				.status-title {
					font-family: 'Playfair Display', Georgia, serif;
					font-size: 32px;
					font-weight: 600;
					color: ${colors.primary};
					margin: 0 0 16px 0;
					letter-spacing: -0.5px;
				}

				.status-message {
					font-size: 18px;
					color: ${colors.foreground};
					margin: 0 0 24px 0;
					line-height: 1.6;
				}

				.booking-reference {
					display: inline-block;
					background: white;
					border: 2px solid ${colors.primary};
					color: ${colors.primary};
					padding: 12px 24px;
					border-radius: 50px;
					font-weight: 600;
					letter-spacing: 0.5px;
					font-size: 16px;
				}

				.info-card {
					background: ${colors.card};
					border: 1px solid ${colors.border};
					border-radius: 12px;
					padding: 32px;
					margin: 32px 0;
				}

				.card-title {
					font-family: 'Playfair Display', Georgia, serif;
					font-size: 22px;
					font-weight: 600;
					color: ${colors.foreground};
					margin: 0 0 24px 0;
					padding-bottom: 12px;
					border-bottom: 2px solid ${colors.border};
				}

				.detail-grid {
					display: grid;
					gap: 16px;
				}

				.detail-item {
					display: flex;
					padding: 16px 0;
					border-bottom: 1px solid rgba(34, 129, 142, 0.15);
					align-items: flex-start;
				}

				.detail-item:last-child {
					border-bottom: none;
				}

				.detail-label {
					font-weight: 800;
					color: ${colors.primary};
					font-size: 12px;
					text-transform: uppercase;
					letter-spacing: 1px;
					min-width: 120px;
					margin-right: 20px;
					flex-shrink: 0;
					background: rgba(34, 129, 142, 0.1);
					padding: 4px 12px;
					border-radius: 20px;
					text-align: center;
				}

				.detail-value {
					color: ${colors.foreground};
					font-size: 16px;
					font-weight: 500;
					flex: 1;
					line-height: 1.5;
				}

				.cta-section {
					text-align: center;
					margin: 50px 0 40px;
					padding: 40px 20px;
					background: linear-gradient(135deg, ${colors.beige} 0%, ${colors.softBeige} 100%);
					border-radius: 12px;
				}

				.cta-title {
					font-family: 'Playfair Display', Georgia, serif;
					font-size: 24px;
					font-weight: 600;
					color: ${colors.foreground};
					margin: 0 0 24px 0;
				}

				.cta-buttons {
					display: flex;
					gap: 20px;
					justify-content: center;
					flex-wrap: wrap;
					margin-top: 16px;
				}

				.cta-button {
					display: inline-block;
					background: linear-gradient(135deg, ${colors.primary} 0%, #1a6e78 100%);
					color: white;
					text-decoration: none;
					padding: 18px 36px;
					border-radius: 12px;
					font-weight: 600;
					font-size: 16px;
					letter-spacing: 0.3px;
					transition: all 0.3s ease;
					box-shadow:
						0 8px 25px rgba(34, 129, 142, 0.3),
						0 2px 6px rgba(34, 129, 142, 0.2);
					min-width: 150px;
					text-align: center;
				}

				.cta-button:hover {
					transform: translateY(-2px);
					box-shadow:
						0 12px 35px rgba(34, 129, 142, 0.4),
						0 4px 12px rgba(34, 129, 142, 0.3);
				}

				.footer {
					background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
					padding: 40px;
					text-align: center;
					border-top: 1px solid ${colors.border};
				}

				.footer-brand {
					font-family: 'Playfair Display', Georgia, serif;
					font-size: 20px;
					font-weight: 600;
					color: ${colors.foreground};
					margin: 0 0 8px 0;
				}

				.footer-tagline {
					color: ${colors.mutedForeground};
					font-size: 14px;
					margin: 0 0 24px 0;
				}

				.footer-links {
					display: flex;
					gap: 16px;
					justify-content: center;
					flex-wrap: wrap;
					margin: 0 0 24px 0;
					align-items: center;
				}

				.footer-link {
					color: ${colors.primary};
					text-decoration: none;
					font-weight: 600;
					font-size: 14px;
					transition: all 0.3s ease;
					padding: 4px 8px;
				}

				.footer-link:hover {
					text-decoration: underline;
					color: #1a6e78;
				}

				.footer-separator {
					color: #94a3b8;
					font-weight: 300;
					margin: 0 4px;
				}

				.footer-contact {
					color: ${colors.mutedForeground};
					font-size: 13px;
					line-height: 1.5;
					margin: 0;
				}

				.footer-contact a {
					color: ${colors.primary};
					text-decoration: none;
				}

				/* Dark mode support */
				@media (prefers-color-scheme: dark) {
					body {
						background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
						color: #ffffff;
					}

					.email-wrapper {
						background: #2a2a2a;
						border: 1px solid #404040;
					}

					.content {
						background: #2a2a2a;
						color: #ffffff;
					}

					.status-section {
						background: linear-gradient(135deg, #333333 0%, #2a2a2a 100%);
						border-color: #404040;
						color: #ffffff;
					}

					.status-title {
						color: #86d6e5;
					}

					.status-message {
						color: #e5e5e5;
					}

					.booking-reference {
						background: #1a1a1a;
						color: #86d6e5;
						border-color: #86d6e5;
					}

					.info-card {
						background: #333333;
						border-color: #404040;
						color: #ffffff;
					}

					.card-title {
						color: #ffffff;
						border-color: #404040;
					}

					.detail-label {
						color: #86d6e5;
						background: rgba(134, 214, 229, 0.2);
					}

					.detail-value {
						color: #e5e5e5;
					}

					.cta-section {
						background: linear-gradient(135deg, #333333 0%, #2a2a2a 100%);
						color: #ffffff;
					}

					.cta-title {
						color: #ffffff;
					}

					.footer {
						background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
						border-color: #404040;
						color: #b3b3b3;
					}

					.footer-brand {
						color: #ffffff;
					}

					.footer-contact {
						color: #b3b3b3;
					}
				}

				@media (max-width: 600px) {
					body { padding: 10px; }
					.header, .content, .footer { padding: 30px 20px; }
					.status-section, .info-card { padding: 24px 20px; }
					.detail-item {
						flex-direction: column;
						gap: 8px;
						padding: 12px 0;
					}
					.detail-label {
						font-size: 11px;
						min-width: auto;
						margin-right: 0;
						margin-bottom: 4px;
						align-self: flex-start;
					}
					.cta-buttons { flex-direction: column; }
					.footer-links {
						flex-direction: column;
						gap: 12px;
					}
					.footer-separator {
						display: none;
					}
				}
			</style>
		</head>
		<body>
			<div class="email-wrapper">
				<div class="header">
					<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Down Under Chauffeurs" class="logo" />
					<h1 class="header-title">${statusTitle}</h1>
					<p class="header-subtitle">Down Under Chauffeurs</p>
				</div>

				<div class="content">
					<div class="status-section">
						<h2 class="status-title">${statusTitle}</h2>
						<p class="status-message">${statusMessage}</p>
						<div class="booking-reference">Reference: ${bookingReference}</div>
					</div>

					<div class="info-card">
						<h3 class="card-title">Trip Details</h3>
						<div class="detail-grid">
							<div class="detail-item">
								<span class="detail-label">Service</span>
								<span class="detail-value">${serviceType}</span>
							</div>
							<div class="detail-item">
								<span class="detail-label">Pickup</span>
								<span class="detail-value">${pickupDate} at ${pickupTime}</span>
							</div>
							<div class="detail-item">
								<span class="detail-label">From</span>
								<span class="detail-value">${booking.originAddress || booking.pickupAddress}</span>
							</div>
							${booking.destinationAddress ? `
							<div class="detail-item">
								<span class="detail-label">To</span>
								<span class="detail-value">${booking.destinationAddress}</span>
							</div>
							` : ''}
						</div>
					</div>

					<div class="info-card">
						<h3 class="card-title">Service Team</h3>
						<div class="detail-grid">
							<div class="detail-item">
								<span class="detail-label">Driver</span>
								<span class="detail-value">${driverName}</span>
							</div>
							<div class="detail-item">
								<span class="detail-label">Vehicle</span>
								<span class="detail-value">${vehicleInfo}</span>
							</div>
						</div>
					</div>

					${status === "completed" ? `
					<div class="cta-section" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac;">
						<h3 class="cta-title">Thank You for Choosing Down Under Chauffeurs</h3>
						<p style="color: ${colors.mutedForeground}; margin: 0 0 24px 0; font-size: 16px;">We hope you enjoyed your luxury travel experience. Your feedback is valuable to us.</p>
					</div>
					` : ''}

					<div class="cta-section">
						<h3 class="cta-title">Manage Your Journey</h3>
						<div class="cta-buttons">
							<a href="${websiteUrl}/my-bookings" class="cta-button">View My Bookings</a>
							<a href="${websiteUrl}/contact-us" class="cta-button">Contact Support</a>
						</div>
						<p style="color: ${colors.mutedForeground}; font-size: 14px; margin: 24px 0 0; line-height: 1.5;">
							Need immediate assistance? Call us at <a href="tel:+61-XXX-XXX-XXX" style="color: ${colors.primary}; text-decoration: none; font-weight: 600;">+61 XXX XXX XXX</a>
						</p>
					</div>
				</div>

				<div class="footer">
					<h4 class="footer-brand">Down Under Chauffeurs</h4>
					<p class="footer-tagline">Premium Luxury Transportation Services</p>
					<div class="footer-links">
						<a href="${websiteUrl}" class="footer-link">Our Website</a>
						<span class="footer-separator">|</span>
						<a href="${websiteUrl}/services" class="footer-link">Services</a>
						<span class="footer-separator">|</span>
						<a href="${websiteUrl}/contact-us" class="footer-link">Contact</a>
					</div>
					<p class="footer-contact">
						This is an automated notification from Down Under Chauffeurs.<br>
						For support or questions, please contact our customer service team.
					</p>
				</div>
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

		// Format pickup date and time
		const { booking, driverUser, car, package: pkg, stops, customer } = bookingDetails;
		const pickupDateTime = booking.scheduledPickupTime || booking.pickupDateTime;
		const pickupDate = new Date(pickupDateTime).toLocaleDateString("en-AU", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		const pickupTime = new Date(pickupDateTime).toLocaleTimeString("en-AU", {
			hour: "2-digit",
			minute: "2-digit",
		});

		const serviceType = pkg?.title || "Custom Trip";
		const vehicleInfo = car ? `${car.brand} ${car.model}` : "Assigned Vehicle";
		const driverName = driverUser.name || "Driver";
		const bookingReference = booking.referenceNumber || booking.id.slice(-6).toUpperCase();

		// Generate React Email template for driver assignment
		console.log(`📧 EMAIL SERVICE: Generating React email template for driver ${driverName}`);
		const template = await renderDriverAssignmentEmail({
			driverName,
			customerName: customer?.name || "Customer",
			bookingReference,
			serviceType,
			pickupDate,
			pickupTime,
			originAddress: booking.originAddress || booking.pickupAddress,
			destinationAddress: booking.destinationAddress,
			vehicleInfo,
			websiteUrl: "https://downunderchauffeurs.com",
			// Additional props
			stops: stops?.map(stop => ({ address: stop.address })) || [],
			passengerCount: booking.passengerCount || 1,
			customerPhone: customer?.phone || "",
		});

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

		// Status-specific content
		let statusTitle = "";
		let statusMessage = "";

		switch (status) {
			case "in_progress":
			case "passenger_on_board":
				statusTitle = "Your Trip Has Started";
				statusMessage = "Your driver has started your trip. You should now be en route to your destination.";
				break;
			case "driver_en_route":
				statusTitle = "Your Trip Has Started";
				statusMessage = "Your driver has started your trip and is now en route to your destination. You should be on your way!";
				break;
			case "arrived_pickup":
				statusTitle = "Driver Has Arrived at Destination";
				statusMessage = "Your driver has arrived at your destination. Your trip is now complete.";
				break;
			case "completed":
				statusTitle = "Trip Completed";
				statusMessage = "Your trip has been completed successfully. Thank you for choosing Down Under Chauffeurs!";
				break;
			default:
				statusTitle = "Booking Status Update";
				statusMessage = "Your booking status has been updated.";
		}

		// Format pickup date and time
		const { booking, driverUser, car, package: pkg, stops } = bookingDetails;
		const pickupDateTime = booking.scheduledPickupTime || booking.pickupDateTime;
		const pickupDate = new Date(pickupDateTime).toLocaleDateString("en-AU", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		const pickupTime = new Date(pickupDateTime).toLocaleTimeString("en-AU", {
			hour: "2-digit",
			minute: "2-digit",
		});

		const serviceType = pkg?.title || "Custom Trip";
		const vehicleInfo = car ? `${car.brand} ${car.model}` : "Assigned Vehicle";
		const driverName = driverUser?.name || "Your Driver";
		const bookingReference = booking.referenceNumber || booking.id.slice(-6).toUpperCase();

		// Generate React Email template with additional driver trips inspired data
		const template = await renderTripStatusEmail({
			customerName: bookingDetails.customer.name || "Customer",
			statusTitle,
			statusMessage,
			bookingReference,
			serviceType,
			pickupDate,
			pickupTime,
			originAddress: booking.originAddress || booking.pickupAddress,
			destinationAddress: booking.destinationAddress,
			driverName,
			vehicleInfo,
			websiteUrl: "https://downunderchauffeurs.com",
			// Additional props to match driver trips design
			status: status,
			stops: stops?.map(stop => ({ address: stop.address })) || [],
			passengerCount: booking.passengerCount || 1,
		});

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