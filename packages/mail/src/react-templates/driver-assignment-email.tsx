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
	Img,
} from "@react-email/components";

interface DriverAssignmentEmailProps {
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

export function DriverAssignmentEmail({
	driverName = "Driver",
	customerName = "Customer",
	bookingReference = "123456",
	serviceType = "Custom Trip",
	pickupDate = "Friday, September 19, 2025",
	pickupTime = "05:30 PM",
	originAddress = "Sydney Opera House, Sydney NSW, Australia",
	destinationAddress = "T1, Departure Plaza, Mascot NSW, Australia",
	vehicleInfo = "Assigned Vehicle",
	websiteUrl = "https://downunderchauffeurs.com",
	stops = [],
	passengerCount = 1,
	customerPhone = "",
}: DriverAssignmentEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>New Booking Assignment - {bookingReference} - Down Under Chauffeurs</Preview>
			<Body style={main}>
				<Container style={container}>
					{/* Header with Logo */}
					<Section style={logoHeader}>
						<Row>
							{/* <Column style={{ width: '60px', paddingRight: '16px', verticalAlign: 'middle' }}>
								<Img
									src={logo}
									alt="Down Under Chauffeurs"
									width="50"
									height="50"
									style={logoStyle}
								/>
							</Column> */}
							<Column style={{ verticalAlign: 'middle', flexGrow: 1 }}>
								<Heading style={brandTitle}>Down Under Chauffeurs</Heading>
								<Text style={brandTagline}>Premium Luxury Transportation Services</Text>
							</Column>
							<Column style={{ width: '120px', verticalAlign: 'middle', textAlign: 'right' }}>
								<Text style={assignmentBadge}>
									NEW ASSIGNMENT
								</Text>
							</Column>
						</Row>
					</Section>

					{/* Content Header */}
					<Section style={contentHeader}>
						<Heading style={headerTitle}>New Booking Assignment</Heading>
						<Text style={headerSubtitle}>You have been assigned to a new trip</Text>
					</Section>

					{/* Main Trip Card - Driver Assignment Styled */}
					<Section style={assignmentCard}>
						{/* Trip Header - Time and Reference */}
						<Section style={tripHeader}>
							<Row>
								<Column style={{ width: '60%' }}>
									<Text style={tripTime}>{pickupTime}</Text>
									<Text style={tripDate}>{pickupDate}</Text>
								</Column>
								<Column style={{ width: '40%', textAlign: 'right' }}>
									<Text style={tripReference}>#{bookingReference}</Text>
								</Column>
							</Row>
						</Section>

						{/* Assignment Message */}
						<Section style={assignmentMessageSection}>
							<Text style={assignmentText}>
								Hello {driverName}, you have been assigned to this booking. Please review the details below and prepare for pickup.
							</Text>
						</Section>

						{/* Route Information - Matching driver trips layout */}
						<Section style={routeSection}>
							<Heading style={sectionTitle}>Journey Route</Heading>

							{/* Pickup Location */}
							<Row style={routeRow}>
								<Column style={{ width: '20px', paddingRight: '12px' }}>
									<div style={{ ...routeIcon, backgroundColor: '#22c55e' }}></div>
								</Column>
								<Column>
									<Text style={routeLabel}>Pick up</Text>
									<Text style={routeAddress}>{originAddress}</Text>
								</Column>
							</Row>

							{/* Stops (if any) */}
							{stops && stops.length > 0 && stops.map((stop, index) => (
								<Row key={index} style={routeRow}>
									<Column style={{ width: '20px', paddingRight: '12px' }}>
										<div style={{ ...routeConnector }}></div>
										<div style={{ ...routeIcon, backgroundColor: '#3b82f6' }}></div>
									</Column>
									<Column>
										<Text style={routeLabel}>Stop {index + 1}</Text>
										<Text style={routeAddress}>{stop.address}</Text>
									</Column>
								</Row>
							))}

							{/* Destination */}
							{destinationAddress && (
								<Row style={routeRow}>
									<Column style={{ width: '20px', paddingRight: '12px' }}>
										<div style={{ ...routeConnector }}></div>
										<div style={{ ...routeIcon, backgroundColor: '#ef4444' }}></div>
									</Column>
									<Column>
										<Text style={routeLabel}>Drop off</Text>
										<Text style={routeAddress}>{destinationAddress}</Text>
									</Column>
								</Row>
							)}
						</Section>

						{/* Trip Details - Compact info like driver trips */}
						<Section style={tripDetails}>
							<Row>
								<Column style={{ width: '50%' }}>
									<Text style={detailLabel}>Customer</Text>
									<Text style={detailValue}>{customerName}</Text>
								</Column>
								<Column style={{ width: '50%' }}>
									<Text style={detailLabel}>Passengers</Text>
									<Text style={detailValue}>{passengerCount} pax</Text>
								</Column>
							</Row>
							<Hr style={detailSeparator} />
							<Row>
								<Column style={{ width: '50%' }}>
									<Text style={detailLabel}>Vehicle</Text>
									<Text style={detailValue}>{vehicleInfo}</Text>
								</Column>
								<Column style={{ width: '50%' }}>
									<Text style={detailLabel}>Service</Text>
									<Text style={detailValue}>{serviceType}</Text>
								</Column>
							</Row>
							{customerPhone && (
								<>
									<Hr style={detailSeparator} />
									<Row>
										<Column>
											<Text style={detailLabel}>Customer Phone</Text>
											<Text style={detailValue}>
												<a href={`tel:${customerPhone}`} style={phoneLink}>{customerPhone}</a>
											</Text>
										</Column>
									</Row>
								</>
							)}
						</Section>

						{/* Action Section */}
						<Section style={actionSection}>
							<Row>
								<Column style={{ textAlign: "center" }}>
									<Button style={primaryButton} href={`${websiteUrl}/driver/trips`}>
										View Driver Dashboard
									</Button>
								</Column>
							</Row>
							<Text style={actionText}>
								Questions about this booking? Contact support at{" "}
								<a href={`${websiteUrl}/contact-us`} style={contactLink}>downunderchauffeurs.com</a>
							</Text>
						</Section>
					</Section>

					{/* Footer */}
					<Section style={footer}>
						<Heading style={footerBrand}>Down Under Chauffeurs</Heading>
						<Text style={footerTagline}>Premium Luxury Transportation Services</Text>
						<Text style={footerLinks}>
							<a href={websiteUrl} style={footerLink}>Our Website</a>
							{" | "}
							<a href={`${websiteUrl}/services`} style={footerLink}>Services</a>
							{" | "}
							<a href={`${websiteUrl}/contact-us`} style={footerLink}>Contact</a>
						</Text>
						<Text style={footerDisclaimer}>
							This is an automated driver assignment from Down Under Chauffeurs.<br />
							For support or questions, please contact our operations team.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

// Driver Assignment Inspired Styles
const main = {
	fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	margin: "0",
	padding: "20px",
	background: "#f9fafb", // Gray-50 like driver interface
	color: "#374151",
	lineHeight: "1.6",
};

const container = {
	maxWidth: "600px",
	margin: "0 auto",
	background: "#ffffff",
	borderRadius: "12px",
	overflow: "hidden",
	boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
	border: "1px solid #e5e7eb",
};

const logoHeader = {
	padding: "24px 24px 20px",
	background: "linear-gradient(135deg, #22818e 0%, #1a6e78 100%)",
	borderBottom: "none",
};

const logoStyle = {
	borderRadius: "8px",
	display: "block",
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

const assignmentBadge = {
	color: "white",
	fontSize: "12px",
	fontWeight: "600",
	padding: "4px 12px",
	borderRadius: "9999px",
	display: "inline-block",
	textTransform: "uppercase" as const,
	letterSpacing: "0.025em",
	backgroundColor: "#f59e0b", // Amber for new assignment
};

const contentHeader = {
	padding: "20px 24px 16px",
	background: "white",
	borderBottom: "1px solid #e5e7eb",
};

const headerTitle = {
	fontSize: "20px",
	fontWeight: "600",
	color: "#111827",
	margin: "0 0 4px 0",
};

const headerSubtitle = {
	fontSize: "14px",
	color: "#6b7280",
	margin: "0",
	fontWeight: "400",
};

const assignmentCard = {
	background: "white",
	border: "1px solid #e5e7eb",
	borderLeftWidth: "4px",
	borderLeftStyle: "solid" as const,
	borderLeftColor: "#f59e0b", // Amber for new assignment
	padding: "24px",
	margin: "0",
};

const tripHeader = {
	marginBottom: "16px",
};

const tripTime = {
	fontSize: "18px",
	fontWeight: "600",
	color: "#111827",
	margin: "0",
};

const tripDate = {
	fontSize: "14px",
	color: "#6b7280",
	margin: "0",
};

const tripReference = {
	fontSize: "14px",
	color: "#6b7280",
	margin: "0",
	fontFamily: "monospace",
};

const assignmentMessageSection = {
	padding: "16px",
	background: "#fef3c7", // Light amber
	border: "1px solid #fcd34d",
	borderRadius: "8px",
	marginBottom: "20px",
};

const assignmentText = {
	fontSize: "16px",
	color: "#92400e",
	margin: "0",
};

const routeSection = {
	marginBottom: "24px",
};

const sectionTitle = {
	fontSize: "16px",
	fontWeight: "600",
	color: "#111827",
	margin: "0 0 16px 0",
};

const routeRow = {
	marginBottom: "12px",
};

const routeIcon = {
	width: "8px",
	height: "8px",
	borderRadius: "50%",
	display: "inline-block",
};

const routeConnector = {
	width: "2px",
	height: "12px",
	background: "#e5e7eb",
	margin: "2px auto",
	display: "block",
};

const routeLabel = {
	fontSize: "12px",
	fontWeight: "600",
	color: "#6b7280",
	margin: "0 0 2px 0",
	textTransform: "uppercase" as const,
	letterSpacing: "0.025em",
};

const routeAddress = {
	fontSize: "14px",
	color: "#374151",
	margin: "0",
	lineHeight: "1.4",
};

const tripDetails = {
	padding: "16px 0",
};

const detailLabel = {
	fontSize: "12px",
	fontWeight: "600",
	color: "#6b7280",
	margin: "0 0 4px 0",
};

const detailValue = {
	fontSize: "14px",
	color: "#111827",
	margin: "0 0 12px 0",
	fontWeight: "500",
};

const phoneLink = {
	color: "#22818e",
	textDecoration: "none",
	fontWeight: "600",
};

const detailSeparator = {
	border: "none",
	borderTop: "1px solid #e5e7eb",
	margin: "12px 0",
};

const actionSection = {
	textAlign: "center" as const,
	margin: "32px 0 24px",
	padding: "24px 20px",
	background: "#f8fafc",
	borderRadius: "8px",
	borderTop: "1px solid #e2e8f0",
};

const actionTitle = {
	fontSize: "18px",
	fontWeight: "600",
	color: "#111827",
	margin: "0 0 16px 0",
};

const primaryButton = {
	background: "linear-gradient(135deg, #22818e 0%, #1a6e78 100%)",
	color: "white",
	textDecoration: "none",
	padding: "12px 24px",
	borderRadius: "8px",
	fontWeight: "600",
	fontSize: "14px",
	letterSpacing: "0.025em",
	display: "inline-block",
	minWidth: "140px",
	textAlign: "center" as const,
	border: "none",
	boxShadow: "0 2px 4px rgba(34, 129, 142, 0.2)",
};

const secondaryButton = {
	background: "#f59e0b",
	color: "white",
	textDecoration: "none",
	padding: "12px 24px",
	borderRadius: "8px",
	fontWeight: "600",
	fontSize: "14px",
	letterSpacing: "0.025em",
	display: "inline-block",
	minWidth: "140px",
	textAlign: "center" as const,
	border: "none",
	boxShadow: "0 2px 4px rgba(245, 158, 11, 0.2)",
};

const actionText = {
	color: "#64748b",
	fontSize: "14px",
	margin: "16px 0 0 0",
	lineHeight: "1.5",
};

const contactLink = {
	color: "#22818e",
	textDecoration: "none",
	fontWeight: "600",
};

const footer = {
	background: "#f8fafc",
	padding: "32px 24px",
	textAlign: "center" as const,
	borderTop: "1px solid #e2e8f0",
};

const footerBrand = {
	fontSize: "20px",
	fontWeight: "600",
	color: "#22818e",
	margin: "0 0 8px 0",
};

const footerTagline = {
	fontSize: "14px",
	color: "#64748b",
	margin: "0 0 16px 0",
	fontWeight: "400",
};

const footerLinks = {
	margin: "16px 0",
	fontSize: "14px",
};

const footerLink = {
	color: "#22818e",
	textDecoration: "none",
	fontWeight: "500",
};

const footerDisclaimer = {
	fontSize: "12px",
	color: "#94a3b8",
	margin: "16px 0 0 0",
	lineHeight: "1.5",
};

export default DriverAssignmentEmail;
