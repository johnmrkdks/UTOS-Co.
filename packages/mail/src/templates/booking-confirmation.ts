import type { EmailTemplate, BookingDetails } from "../types";

export function generateBookingConfirmationTemplate(
	customerName: string,
	bookingDetails: BookingDetails
): EmailTemplate {
	const formattedAmount = new Intl.NumberFormat('en-AU', {
		style: 'currency',
		currency: bookingDetails.currency || 'AUD'
	}).format(bookingDetails.amount / 100);

	return {
		subject: `Booking Confirmed - ${bookingDetails.bookingId}`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Booking Confirmation - Down Under Chauffeur</title>
			</head>
			<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
				<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
					<div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px 20px; text-align: center;">
						<h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
						<p style="color: #cccccc; margin: 10px 0 0 0; font-size: 16px;">Down Under Chauffeur</p>
					</div>
					<div style="padding: 40px 20px;">
						<h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hello ${customerName},</h2>
						<p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
							Your luxury chauffeur booking has been confirmed. Here are your booking details:
						</p>
						
						<div style="background-color: #f8f9fa; padding: 25px; border-radius: 5px; margin: 30px 0;">
							<h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px;">Booking Details</h3>
							<div style="margin-bottom: 15px;">
								<strong style="color: #333;">Booking ID:</strong> ${bookingDetails.bookingId}
							</div>
							<div style="margin-bottom: 15px;">
								<strong style="color: #333;">Service:</strong> ${bookingDetails.serviceType}
							</div>
							${bookingDetails.packageName ? `
							<div style="margin-bottom: 15px;">
								<strong style="color: #333;">Package:</strong> ${bookingDetails.packageName}
							</div>
							` : ''}
							<div style="margin-bottom: 15px;">
								<strong style="color: #333;">Date & Time:</strong> ${new Date(bookingDetails.pickupDate).toLocaleDateString('en-AU')} at ${bookingDetails.pickupTime}
							</div>
							<div style="margin-bottom: 15px;">
								<strong style="color: #333;">Pickup Location:</strong> ${bookingDetails.pickupAddress}
							</div>
							${bookingDetails.destinationAddress ? `
							<div style="margin-bottom: 15px;">
								<strong style="color: #333;">Destination:</strong> ${bookingDetails.destinationAddress}
							</div>
							` : ''}
							${bookingDetails.driverName ? `
							<div style="margin-bottom: 15px;">
								<strong style="color: #333;">Driver:</strong> ${bookingDetails.driverName}
							</div>
							` : ''}
							${bookingDetails.vehicleDetails ? `
							<div style="margin-bottom: 15px;">
								<strong style="color: #333;">Vehicle:</strong> ${bookingDetails.vehicleDetails}
							</div>
							` : ''}
							<div style="border-top: 2px solid #333; margin-top: 20px; padding-top: 15px;">
								<strong style="color: #333; font-size: 18px;">Total Amount: ${formattedAmount}</strong>
							</div>
						</div>

						<div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 30px 0;">
							<h3 style="color: #2d5a2d; margin: 0 0 15px 0; font-size: 16px;">What's Next?</h3>
							<ul style="color: #2d5a2d; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
								<li>You'll receive a call from your driver 15-30 minutes before pickup</li>
								<li>Your driver will arrive at the specified pickup location</li>
								<li>Enjoy your luxury travel experience!</li>
							</ul>
						</div>

						<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
							Need to make changes or have questions? Contact our support team with your booking ID.
						</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};
}