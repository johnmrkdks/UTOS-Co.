import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Section,
	Row,
	Column,
	Heading,
	Text,
	Button,
	Hr,
} from "@react-email/components";

interface AdminNewBookingEmailProps {
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

export function AdminNewBookingEmail({
	adminName = "Admin",
	customerName = "Customer",
	customerEmail = "customer@example.com",
	customerPhone,
	bookingReference = "123456",
	serviceType = "Custom Trip",
	pickupDate = "Friday, September 19, 2025",
	pickupTime = "05:30 PM",
	originAddress = "Sydney Opera House, Sydney NSW, Australia",
	destinationAddress = "T1, Departure Plaza, Mascot NSW, Australia",
	vehicleInfo = "Luxury Vehicle",
	websiteUrl = "https://downunderchauffeurs.com",
	stops = [],
	passengerCount = 1,
	luggageCount = 0,
	specialRequests,
	quotedAmount,
}: AdminNewBookingEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>New Booking Alert - #{bookingReference} - {customerName}</Preview>
			<Body style={main}>
				<Container style={container}>
					{/* Header with Logo */}
					<Section style={logoHeader}>
						<Row>
							<Column style={{ verticalAlign: 'middle', flexGrow: 1 }}>
								<Heading style={brandTitle}>Down Under Chauffeurs</Heading>
								<Text style={brandTagline}>Admin Dashboard</Text>
							</Column>
						</Row>
					</Section>

					{/* Alert Header */}
					<Section style={alertHeader}>
						<Heading style={alertTitle}>🔔 New Booking Received</Heading>
						<Text style={alertSubtitle}>
							A new booking has been created and requires driver assignment.
						</Text>
					</Section>

					{/* Booking Card */}
					<Section style={bookingCard}>
						{/* Booking Header */}
						<Row>
							<Column style={{ width: '60%' }}>
								<Text style={bookingTime}>{pickupTime}</Text>
								<Text style={bookingDate}>{pickupDate}</Text>
							</Column>
							<Column style={{ width: '40%', textAlign: 'right' as const }}>
								<Text style={bookingReferenceStyle}>#{bookingReference}</Text>
							</Column>
						</Row>

						<Hr style={divider} />

						{/* Customer Information */}
						<Section style={customerSection}>
							<Text style={sectionTitle}>Customer Information</Text>
							<Row>
								<Column style={{ width: '50%' }}>
									<Text style={detailLabel}>Name</Text>
									<Text style={detailValue}>{customerName}</Text>
								</Column>
								<Column style={{ width: '50%' }}>
									<Text style={detailLabel}>Email</Text>
									<Text style={detailValue}>
										<a href={`mailto:${customerEmail}`} style={emailLink}>{customerEmail}</a>
									</Text>
								</Column>
							</Row>
							{customerPhone && (
								<Row style={{ marginTop: '8px' }}>
									<Column>
										<Text style={detailLabel}>Phone</Text>
										<Text style={detailValue}>
											<a href={`tel:${customerPhone}`} style={phoneLink}>{customerPhone}</a>
										</Text>
									</Column>
								</Row>
							)}
						</Section>

						<Hr style={divider} />

						{/* Booking Details */}
						<Section style={bookingDetails}>
							<Text style={sectionTitle}>Booking Details</Text>

							<Row>
								<Column>
									<Text style={detailLabel}>Service Type</Text>
									<Text style={detailValue}>{serviceType}</Text>
								</Column>
							</Row>

							<Hr style={detailSeparator} />

							<Row>
								<Column>
									<Text style={detailLabel}>Pickup Location</Text>
									<Text style={detailValue}>{originAddress}</Text>
								</Column>
							</Row>

							{stops && stops.length > 0 && (
								<>
									<Hr style={detailSeparator} />
									<Row>
										<Column>
											<Text style={detailLabel}>Stops ({stops.length})</Text>
											{stops.map((stop, index) => (
												<Text key={index} style={detailValue}>
													{index + 1}. {stop.address}
												</Text>
											))}
										</Column>
									</Row>
								</>
							)}

							{destinationAddress && (
								<>
									<Hr style={detailSeparator} />
									<Row>
										<Column>
											<Text style={detailLabel}>Drop-off Location</Text>
											<Text style={detailValue}>{destinationAddress}</Text>
										</Column>
									</Row>
								</>
							)}

							<Hr style={detailSeparator} />

							<Row>
								<Column style={{ width: '50%' }}>
									<Text style={detailLabel}>Vehicle Requested</Text>
									<Text style={detailValue}>{vehicleInfo}</Text>
								</Column>
								<Column style={{ width: '50%' }}>
									<Text style={detailLabel}>Passengers</Text>
									<Text style={detailValue}>{passengerCount}</Text>
								</Column>
							</Row>

							<Hr style={detailSeparator} />

							<Row>
								<Column style={{ width: '50%' }}>
									<Text style={detailLabel}>Luggage</Text>
									<Text style={detailValue}>{luggageCount} piece{luggageCount !== 1 ? 's' : ''}</Text>
								</Column>
							</Row>

							{specialRequests && (
								<>
									<Hr style={detailSeparator} />
									<Row>
										<Column>
											<Text style={detailLabel}>Special Requests</Text>
											<Text style={detailValue}>{specialRequests}</Text>
										</Column>
									</Row>
								</>
							)}

							{quotedAmount && (
								<>
									<Hr style={detailSeparator} />
									<Row>
										<Column>
											<Text style={detailLabel}>Quoted Amount</Text>
											<Text style={amountValue}>${quotedAmount.toFixed(2)}</Text>
										</Column>
									</Row>
								</>
							)}
						</Section>

						{/* Action Required Notice */}
						<Section style={actionSection}>
							<Text style={actionTitle}>⚡ Action Required</Text>
							<Text style={actionText}>
								• Assign a driver to this booking<br/>
								• Verify vehicle availability<br/>
								• Confirm pickup details with customer if needed
							</Text>
						</Section>

						{/* CTA Section */}
						<Section style={ctaSection}>
							<Button style={ctaButton} href={`${websiteUrl}/dashboard/bookings`}>
								Manage Booking
							</Button>
							<Text style={contactText}>
								Quick Actions:{" "}
								<a href={`${websiteUrl}/dashboard/bookings/${bookingReference}`} style={quickLink}>View Details</a>
								{" | "}
								<a href={`${websiteUrl}/dashboard/drivers`} style={quickLink}>Assign Driver</a>
							</Text>
						</Section>
					</Section>

					{/* Footer */}
					<Section style={footer}>
						<Text style={footerBrand}>Down Under Chauffeurs - Admin System</Text>
						<Text style={footerDisclaimer}>
							Automated notification | <a href={`${websiteUrl}/dashboard`} style={footerLink}>Admin Dashboard</a>
						</Text>
						{/* Anti-clipping measures */}
						<Text style={{ fontSize: '1px', color: '#ffffff', lineHeight: '1px', opacity: 0, overflow: 'hidden', display: 'none' }}>
							Admin: {bookingReference}-{customerName.replace(/\s/g, '')}-{new Date().getTime().toString().slice(-6)}-{Math.random().toString(36).substr(2, 5)}
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

export default AdminNewBookingEmail;

// Styles
const main = {
	fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	margin: "0",
	padding: "10px",
	background: "#f8fafc",
	color: "#1e293b",
	lineHeight: "1.5",
};

const container = {
	maxWidth: "600px",
	margin: "0 auto",
	background: "#ffffff",
	borderRadius: "8px",
	overflow: "hidden",
	boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const logoHeader = {
	padding: "16px 20px",
	background: "linear-gradient(135deg, #22818e 0%, #1a6e78 100%)",
	borderBottom: "none",
};

const brandTitle = {
	fontFamily: "'Playfair Display', Georgia, serif",
	fontSize: "28px",
	fontWeight: "600",
	color: "white",
	margin: "0 0 4px 0",
	letterSpacing: "-0.5px",
};

const brandTagline = {
	fontSize: "14px",
	color: "rgba(255, 255, 255, 0.85)",
	margin: "0",
	fontWeight: "300",
};

const alertHeader = {
	padding: "20px 20px 16px",
	background: "#fef3c7",
	borderBottom: "2px solid #f59e0b",
	textAlign: "center" as const,
};

const alertTitle = {
	fontSize: "22px",
	fontWeight: "600",
	color: "#92400e",
	margin: "0 0 8px 0",
};

const alertSubtitle = {
	fontSize: "14px",
	color: "#78350f",
	margin: "0",
	fontWeight: "400",
};

const bookingCard = {
	background: "white",
	border: "1px solid #e5e7eb",
	borderLeftWidth: "4px",
	borderLeftStyle: "solid" as const,
	borderLeftColor: "#f59e0b",
	padding: "18px",
	margin: "0",
};

const bookingTime = {
	fontSize: "18px",
	fontWeight: "600",
	color: "#0f172a",
	margin: "0",
};

const bookingDate = {
	fontSize: "14px",
	color: "#6b7280",
	margin: "0",
};

const bookingReferenceStyle = {
	fontSize: "14px",
	color: "#6b7280",
	margin: "0",
	fontFamily: "monospace",
};

const divider = {
	border: "none",
	borderTop: "2px solid #e5e7eb",
	margin: "16px 0",
};

const sectionTitle = {
	fontSize: "14px",
	fontWeight: "600",
	color: "#475569",
	margin: "0 0 12px 0",
	textTransform: "uppercase" as const,
	letterSpacing: "0.5px",
};

const customerSection = {
	background: "#f8fafc",
	padding: "12px",
	borderRadius: "6px",
	marginBottom: "16px",
};

const bookingDetails = {
	padding: "0",
};

const detailLabel = {
	fontSize: "12px",
	fontWeight: "600",
	color: "#6b7280",
	margin: "0 0 4px 0",
	textTransform: "uppercase" as const,
	letterSpacing: "0.5px",
};

const detailValue = {
	fontSize: "14px",
	color: "#0f172a",
	margin: "0 0 12px 0",
	fontWeight: "500",
};

const amountValue = {
	fontSize: "20px",
	color: "#059669",
	margin: "0",
	fontWeight: "600",
};

const emailLink = {
	color: "#22818e",
	textDecoration: "none",
	fontWeight: "500",
};

const phoneLink = {
	color: "#22818e",
	textDecoration: "none",
	fontWeight: "500",
};

const detailSeparator = {
	border: "none",
	borderTop: "1px solid #e5e7eb",
	margin: "12px 0",
};

const actionSection = {
	background: "#fef2f2",
	border: "1px solid #fecaca",
	borderRadius: "6px",
	padding: "16px",
	margin: "16px 0",
};

const actionTitle = {
	fontSize: "14px",
	fontWeight: "600",
	color: "#991b1b",
	margin: "0 0 8px 0",
};

const actionText = {
	fontSize: "13px",
	color: "#991b1b",
	margin: "0",
	lineHeight: "1.6",
};

const ctaSection = {
	textAlign: "center" as const,
	margin: "20px 0 16px",
};

const ctaButton = {
	background: "#22818e",
	color: "white",
	padding: "12px 32px",
	borderRadius: "8px",
	textDecoration: "none",
	fontWeight: "600",
	fontSize: "14px",
	display: "inline-block",
};

const contactText = {
	fontSize: "14px",
	color: "#6b7280",
	marginTop: "16px",
};

const quickLink = {
	color: "#22818e",
	textDecoration: "none",
	fontWeight: "500",
};

const footer = {
	padding: "24px 20px",
	textAlign: "center" as const,
	background: "#f8fafc",
	borderTop: "1px solid #e5e7eb",
};

const footerBrand = {
	fontSize: "14px",
	fontWeight: "600",
	color: "#475569",
	margin: "0 0 8px 0",
};

const footerDisclaimer = {
	fontSize: "12px",
	color: "#94a3b8",
	margin: "0",
	lineHeight: "1.5",
};

const footerLink = {
	color: "#22818e",
	textDecoration: "none",
	fontWeight: "500",
};
