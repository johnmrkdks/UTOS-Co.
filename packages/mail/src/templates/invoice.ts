import type { EmailTemplate, InvoiceData } from "../types";

export function generateInvoiceTemplate(
	customerName: string,
	bookingId: string,
	invoiceData: InvoiceData,
): EmailTemplate {
	const formattedAmount = new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: invoiceData.currency || "AUD",
	}).format(invoiceData.amount / 100);

	return {
		subject: `Invoice for Booking ${bookingId} - Down Under Chauffeur`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Invoice - Down Under Chauffeur</title>
			</head>
			<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
				<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
					<div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px 20px; text-align: center;">
						<h1 style="color: white; margin: 0; font-size: 28px;">Invoice</h1>
						<p style="color: #cccccc; margin: 10px 0 0 0; font-size: 16px;">Down Under Chauffeur</p>
					</div>
					<div style="padding: 40px 20px;">
						<div style="margin-bottom: 30px;">
							<h2 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Thank you, ${customerName}!</h2>
							<p style="color: #666; font-size: 16px; margin: 0;">Booking ID: <strong>${bookingId}</strong></p>
						</div>
						
						<div style="background-color: #f8f9fa; padding: 25px; border-radius: 5px; margin: 30px 0;">
							<h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px;">Service Details</h3>
							<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
								<span style="color: #666;">Service Type:</span>
								<span style="color: #333; font-weight: bold;">${invoiceData.serviceType}</span>
							</div>
							${
								invoiceData.packageName
									? `
							<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
								<span style="color: #666;">Package:</span>
								<span style="color: #333; font-weight: bold;">${invoiceData.packageName}</span>
							</div>
							`
									: ""
							}
							${
								invoiceData.route
									? `
							<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
								<span style="color: #666;">Route:</span>
								<span style="color: #333; font-weight: bold;">${invoiceData.route}</span>
							</div>
							`
									: ""
							}
							<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
								<span style="color: #666;">Date:</span>
								<span style="color: #333; font-weight: bold;">${new Date(invoiceData.bookingDate).toLocaleDateString("en-AU")}</span>
							</div>
							<div style="border-top: 2px solid #333; margin-top: 20px; padding-top: 15px;">
								<div style="display: flex; justify-content: space-between;">
									<span style="color: #333; font-size: 18px; font-weight: bold;">Total Amount:</span>
									<span style="color: #333; font-size: 18px; font-weight: bold;">${formattedAmount}</span>
								</div>
							</div>
						</div>

						<p style="color: #666; font-size: 16px; line-height: 1.6; margin: 30px 0;">
							We appreciate your business and hope you enjoyed your luxury travel experience with us.
						</p>
						
						<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 30px 0;">
							<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
								<strong>Need assistance?</strong><br>
								Contact our customer service team for any questions about your booking or invoice.
							</p>
						</div>
					</div>
				</div>
			</body>
			</html>
		`,
	};
}
