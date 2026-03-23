import type { BookingDetails, EmailTemplate } from "../types";

export function generateBookingConfirmationTemplate(
	customerName: string,
	bookingDetails: BookingDetails,
): EmailTemplate {
	const formattedAmount = new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: bookingDetails.currency || "AUD",
	}).format(bookingDetails.amount / 100);

	const formattedDate = new Date(bookingDetails.pickupDate).toLocaleDateString(
		"en-AU",
		{
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	);

	// Generate booking reference - last 6 digits or use reference number if available
	const bookingReference = bookingDetails.bookingId.slice(-6).toUpperCase();

	// Convert oklch colors to standard CSS to match website design
	const colors = {
		primary: "#22818e", // oklch(0.45 0.08 180) converted
		primaryLight: "#86d6e5", // oklch(0.75 0.18 180) converted
		background: "#ffffff", // oklch(1 0 0)
		foreground: "#3c3c3c", // oklch(0.235 0 0)
		beige: "#f7f2ee", // oklch(0.9404 0.0446 107.23)
		softBeige: "#faf8f5", // oklch(0.9726 0.0132 111.27)
		card: "#fefdf9", // oklch(0.98 0.01 85)
		muted: "#e8e3db", // oklch(0.9 0.02 85)
		mutedForeground: "#737373", // oklch(0.45 0 0)
		border: "#d4cabe", // oklch(0.85 0.02 85)
	};

	return {
		subject: `Booking Confirmed - Reference ${bookingReference}`,
		html: `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta name="x-apple-disable-message-reformatting">
				<title>Booking Confirmation - Down Under Chauffeurs</title>
				<link rel="preconnect" href="https://fonts.googleapis.com">
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
				<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
				<style>
					* { box-sizing: border-box; }
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

					.header-icon {
						width: 80px;
						height: 80px;
						background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%);
						border-radius: 50%;
						margin: 0 auto 24px;
						display: flex;
						align-items: center;
						justify-content: center;
						box-shadow: 0 8px 32px rgba(34, 129, 142, 0.3);
					}

					.confirmation-checkmark {
						width: 40px;
						height: 40px;
						border: 3px solid white;
						border-radius: 50%;
						position: relative;
					}

					.confirmation-checkmark::after {
						content: '';
						position: absolute;
						top: 8px;
						left: 12px;
						width: 8px;
						height: 16px;
						border: solid white;
						border-width: 0 3px 3px 0;
						transform: rotate(45deg);
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

					.greeting-section {
						text-align: center;
						margin-bottom: 40px;
					}

					.greeting-title {
						font-family: 'Playfair Display', Georgia, serif;
						font-size: 32px;
						font-weight: 600;
						color: ${colors.foreground};
						margin: 0 0 16px 0;
						letter-spacing: -0.5px;
					}

					.greeting-message {
						font-size: 18px;
						color: ${colors.mutedForeground};
						margin: 0;
						max-width: 480px;
						margin-left: auto;
						margin-right: auto;
						line-height: 1.6;
					}

					.booking-details-card {
						background: linear-gradient(135deg, ${colors.softBeige} 0%, ${colors.card} 100%);
						border: 1px solid ${colors.border};
						border-radius: 16px;
						padding: 40px;
						margin: 40px 0;
						box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
					}

					.card-header {
						display: flex;
						align-items: center;
						margin-bottom: 32px;
						padding-bottom: 16px;
						border-bottom: 2px solid ${colors.border};
					}

					.card-icon {
						width: 48px;
						height: 48px;
						background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%);
						border-radius: 12px;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 16px;
						box-shadow: 0 4px 12px rgba(34, 129, 142, 0.2);
					}

					.card-icon-text {
						color: white;
						font-size: 20px;
						font-weight: bold;
					}

					.card-title {
						font-family: 'Playfair Display', Georgia, serif;
						font-size: 24px;
						font-weight: 600;
						color: ${colors.foreground};
						margin: 0;
					}

					.detail-row {
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						padding: 20px 0;
						border-bottom: 1px solid ${colors.border};
					}

					.detail-row:last-child {
						border-bottom: none;
					}

					.detail-label {
						color: ${colors.mutedForeground};
						font-weight: 500;
						font-size: 15px;
						flex-shrink: 0;
						min-width: 140px;
					}

					.detail-value {
						color: ${colors.foreground};
						font-weight: 600;
						font-size: 16px;
						text-align: right;
						flex: 1;
					}

					.booking-reference {
						background: white;
						border: 2px solid ${colors.primary};
						color: ${colors.primary};
						padding: 8px 16px;
						border-radius: 8px;
						font-family: 'Courier New', monospace;
						font-weight: 600;
						font-size: 14px;
						letter-spacing: 0.5px;
					}

					.total-section {
						background: linear-gradient(135deg, ${colors.primary} 0%, #1e6b75 100%);
						padding: 24px;
						border-radius: 12px;
						margin-top: 16px;
						box-shadow: 0 4px 12px rgba(34, 129, 142, 0.2);
					}

					.total-row {
						display: flex;
						justify-content: space-between;
						align-items: center;
					}

					.total-label {
						color: rgba(255, 255, 255, 0.9);
						font-size: 16px;
						font-weight: 500;
					}

					.total-amount {
						color: white;
						font-size: 28px;
						font-weight: 700;
						font-family: 'Playfair Display', Georgia, serif;
					}

					.next-steps-card {
						background: linear-gradient(135deg, ${colors.softBeige} 0%, ${colors.card} 100%);
						border: 1px solid ${colors.border};
						border-radius: 16px;
						padding: 40px;
						margin: 40px 0;
					}

					.step-item {
						display: flex;
						align-items: flex-start;
						margin-bottom: 24px;
					}

					.step-item:last-child {
						margin-bottom: 0;
					}

					.step-number {
						width: 32px;
						height: 32px;
						background: ${colors.primary};
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 16px;
						flex-shrink: 0;
						margin-top: 2px;
					}

					.step-number-text {
						color: white;
						font-size: 14px;
						font-weight: bold;
					}

					.step-content {
						flex: 1;
					}

					.step-title {
						color: ${colors.foreground};
						font-weight: 600;
						font-size: 16px;
						margin: 0 0 4px 0;
					}

					.step-description {
						color: ${colors.mutedForeground};
						font-size: 14px;
						margin: 0;
						line-height: 1.5;
					}

					.support-section {
						background: ${colors.muted};
						border: 1px solid ${colors.border};
						border-radius: 12px;
						padding: 32px;
						text-align: center;
						margin: 40px 0;
					}

					.support-title {
						color: ${colors.foreground};
						font-size: 20px;
						font-weight: 600;
						margin: 0 0 12px 0;
					}

					.support-text {
						color: ${colors.mutedForeground};
						font-size: 14px;
						margin: 0 0 16px 0;
						line-height: 1.5;
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
						margin: 0 0 16px 0;
					}

					.footer-text {
						color: ${colors.mutedForeground};
						font-size: 12px;
						line-height: 1.5;
						margin: 0;
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

						.greeting-title, .card-title, .support-title, .footer-brand {
							color: #ffffff;
						}

						.greeting-message, .detail-label, .step-description, .support-text, .footer-tagline, .footer-text {
							color: #b3b3b3;
						}

						.detail-value, .step-title {
							color: #e5e5e5;
						}

						.booking-details-card, .next-steps-card {
							background: linear-gradient(135deg, #333333 0%, #2a2a2a 100%);
							border-color: #404040;
						}

						.card-header {
							border-color: #404040;
						}

						.detail-row {
							border-color: #404040;
						}

						.support-section {
							background: #333333;
							border-color: #404040;
						}

						.footer {
							background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
							border-color: #404040;
						}
					}

					@media (max-width: 600px) {
						body { padding: 10px; }
						.header, .content, .footer { padding: 30px 20px; }
						.booking-details-card, .next-steps-card, .support-section { padding: 24px 20px; }
						.detail-row { flex-direction: column; gap: 8px; align-items: flex-start; }
						.detail-label { min-width: auto; }
						.detail-value { text-align: left; }
						.card-header { flex-direction: column; text-align: center; }
						.card-icon { margin-bottom: 12px; margin-right: 0; }
					}
				</style>
			</head>
			<body>
				<div class="email-wrapper">
					<div class="header">
						<div class="header-icon">
							<div class="confirmation-checkmark"></div>
						</div>
						<h1 class="header-title">Booking Confirmed</h1>
						<p class="header-subtitle">Down Under Chauffeurs</p>
					</div>

					<div class="content">
						<div class="greeting-section">
							<h2 class="greeting-title">Hello ${customerName}</h2>
							<p class="greeting-message">
								Your premium luxury transportation is confirmed. We're excited to provide you with exceptional chauffeur service.
							</p>
						</div>

						<div class="booking-details-card">
							<div class="card-header">
								<div class="card-icon">
									<span class="card-icon-text">DB</span>
								</div>
								<h3 class="card-title">Booking Details</h3>
							</div>

							<div>
								<div class="detail-row">
									<span class="detail-label">Booking Reference</span>
									<span class="booking-reference">${bookingReference}</span>
								</div>

								<div class="detail-row">
									<span class="detail-label">Service Type</span>
									<span class="detail-value">${bookingDetails.serviceType}</span>
								</div>

								${
									bookingDetails.packageName
										? `
								<div class="detail-row">
									<span class="detail-label">Package</span>
									<span class="detail-value">${bookingDetails.packageName}</span>
								</div>
								`
										: ""
								}

								<div class="detail-row">
									<span class="detail-label">Date & Time</span>
									<div class="detail-value">
										<div>${formattedDate}</div>
										<div style="font-size: 14px; color: ${colors.mutedForeground}; margin-top: 2px;">at ${bookingDetails.pickupTime}</div>
									</div>
								</div>

								<div class="detail-row">
									<span class="detail-label">Pickup Location</span>
									<span class="detail-value">${bookingDetails.pickupAddress}</span>
								</div>

								${
									bookingDetails.destinationAddress
										? `
								<div class="detail-row">
									<span class="detail-label">Destination</span>
									<span class="detail-value">${bookingDetails.destinationAddress}</span>
								</div>
								`
										: ""
								}

								${
									bookingDetails.driverName
										? `
								<div class="detail-row">
									<span class="detail-label">Your Driver</span>
									<span class="detail-value">${bookingDetails.driverName}</span>
								</div>
								`
										: ""
								}

								${
									bookingDetails.vehicleDetails
										? `
								<div class="detail-row">
									<span class="detail-label">Vehicle</span>
									<span class="detail-value">${bookingDetails.vehicleDetails}</span>
								</div>
								`
										: ""
								}

								<div class="total-section">
									<div class="total-row">
										<span class="total-label">Total Amount</span>
										<span class="total-amount">${formattedAmount}</span>
									</div>
								</div>
							</div>
						</div>

						<div class="next-steps-card">
							<div class="card-header">
								<div class="card-icon">
									<span class="card-icon-text">NS</span>
								</div>
								<h3 class="card-title">What Happens Next?</h3>
							</div>

							<div>
								<div class="step-item">
									<div class="step-number">
										<span class="step-number-text">1</span>
									</div>
									<div class="step-content">
										<div class="step-title">Driver Contact</div>
										<div class="step-description">You'll receive a call 15-30 minutes before pickup with driver details</div>
									</div>
								</div>

								<div class="step-item">
									<div class="step-number">
										<span class="step-number-text">2</span>
									</div>
									<div class="step-content">
										<div class="step-title">Punctual Arrival</div>
										<div class="step-description">Your professional driver will arrive at the specified pickup location on time</div>
									</div>
								</div>

								<div class="step-item">
									<div class="step-number">
										<span class="step-number-text">3</span>
									</div>
									<div class="step-content">
										<div class="step-title">Premium Experience</div>
										<div class="step-description">Sit back, relax, and enjoy your luxury travel experience in our premium vehicles</div>
									</div>
								</div>
							</div>
						</div>

						<div class="support-section">
							<h4 class="support-title">Need Assistance?</h4>
							<p class="support-text">
								Have questions or need to make changes? Our support team is here to help.<br>
								Please reference your booking ID: <strong>${bookingReference}</strong>
							</p>
						</div>
					</div>

					<div class="footer">
						<h4 class="footer-brand">Down Under Chauffeurs</h4>
						<p class="footer-tagline">Premium Luxury Transportation Services</p>
						<p class="footer-text">
							This email was sent regarding your booking confirmation.<br>
							© ${new Date().getFullYear()} Down Under Chauffeurs. All rights reserved.
						</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};
}
