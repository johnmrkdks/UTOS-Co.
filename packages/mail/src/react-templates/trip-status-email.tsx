import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Preview,
	Row,
	Section,
	Text,
} from "@react-email/components";

interface TripStatusEmailProps {
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

export function TripStatusEmail({
	customerName = "Customer",
	statusTitle = "Trip Status Update",
	statusMessage = "Your trip status has been updated.",
	bookingReference = "123456",
	serviceType = "Custom Trip",
	pickupDate = "Friday, September 19, 2025",
	pickupTime = "05:30 PM",
	originAddress = "Sydney Opera House, Sydney NSW, Australia",
	destinationAddress = "T1, Departure Plaza, Mascot NSW, Australia",
	driverName = "Your Driver",
	driverPhone,
	driverEmail,
	vehicleInfo = "Assigned Vehicle",
	websiteUrl = "https://downunderchauffeurs.com",
	status = "confirmed",
	stops = [],
	passengerCount = 1,
	// Fare breakdown props
	baseFare,
	distanceFare,
	extraCharges,
	finalAmount,
	actualDistance,
	estimatedDistance,
	extrasDetails,
}: TripStatusEmailProps) {
	// Status-based styling matching driver trips page
	const getStatusStyle = () => {
		switch (status) {
			case "driver_assigned":
				return { borderLeftColor: "#3b82f6", badgeColor: "#3b82f6" }; // Blue
			case "driver_en_route":
				return { borderLeftColor: "#eab308", badgeColor: "#eab308" }; // Yellow
			case "arrived_pickup":
				return { borderLeftColor: "#f97316", badgeColor: "#f97316" }; // Orange
			case "passenger_on_board":
			case "in_progress":
				return { borderLeftColor: "#22c55e", badgeColor: "#22c55e" }; // Green
			case "dropped_off":
			case "awaiting_extras":
				return { borderLeftColor: "#a855f7", badgeColor: "#a855f7" }; // Purple
			case "completed":
				return { borderLeftColor: "#6b7280", badgeColor: "#6b7280" }; // Gray
			default:
				return { borderLeftColor: "#22818e", badgeColor: "#22818e" }; // Teal (default)
		}
	};

	const statusStyle = getStatusStyle();

	return (
		<Html>
			<Head />
			<Preview>
				{statusTitle} - Booking #{bookingReference} - {customerName}
			</Preview>
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
							<Column style={{ verticalAlign: "middle", flexGrow: 1 }}>
								<Heading style={brandTitle}>Down Under Chauffeurs</Heading>
								<Text style={brandTagline}>
									Premium Luxury Transportation Services
								</Text>
							</Column>
						</Row>
					</Section>

					{/* Content Header */}
					<Section style={contentHeader}>
						<Heading style={headerTitle}>{statusTitle}</Heading>
						<Text style={headerSubtitle}>{statusMessage}</Text>
						{/* Content uniqueness marker */}
						<span
							style={{
								fontSize: "0px",
								color: "transparent",
								lineHeight: "0px",
							}}
						>
							{bookingReference.slice(-4)}.{customerName.slice(0, 2)}
						</span>
					</Section>

					{/* Compact Trip Card */}
					<Section
						style={{
							...tripCard,
							borderLeftColor: statusStyle.borderLeftColor,
						}}
					>
						{/* Trip Header */}
						<Row>
							<Column style={{ width: "60%" }}>
								<Text style={tripTime}>{pickupTime}</Text>
								<Text style={tripDate}>{pickupDate}</Text>
							</Column>
							<Column style={{ width: "40%", textAlign: "right" }}>
								<Text style={tripReference}>#{bookingReference}</Text>
							</Column>
						</Row>

						{/* Essential Trip Info */}
						<Section style={tripDetails}>
							<Row>
								<Column>
									<Text style={detailLabel}>Pickup</Text>
									<Text style={detailValue}>{originAddress}</Text>
								</Column>
							</Row>
							{destinationAddress && (
								<Row>
									<Column>
										<Text style={detailLabel}>Drop off</Text>
										<Text style={detailValue}>{destinationAddress}</Text>
									</Column>
								</Row>
							)}
							<Hr style={detailSeparator} />
							<Row>
								<Column style={{ width: "50%" }}>
									<Text style={detailLabel}>Driver</Text>
									<Text style={detailValue}>{driverName}</Text>
									{driverPhone && (
										<>
											<Text style={detailLabel}>Phone</Text>
											<Text style={detailValue}>
												<a href={`tel:${driverPhone}`} style={contactLink}>
													{driverPhone}
												</a>
											</Text>
										</>
									)}
									{driverEmail && (
										<>
											<Text style={detailLabel}>Email</Text>
											<Text style={detailValue}>
												<a href={`mailto:${driverEmail}`} style={contactLink}>
													{driverEmail}
												</a>
											</Text>
										</>
									)}
								</Column>
								<Column style={{ width: "50%" }}>
									<Text style={detailLabel}>Vehicle</Text>
									<Text style={detailValue}>{vehicleInfo}</Text>
								</Column>
							</Row>
						</Section>

						{/* Fare Breakdown Section (only for completed trips) */}
						{status === "completed" && finalAmount && (
							<Section style={fareBreakdownSection}>
								<Heading style={fareBreakdownTitle}>
									Trip Summary & Fare Breakdown
								</Heading>

								{/* Trip Details */}
								<Section style={tripSummary}>
									<Row>
										<Column style={{ width: "50%" }}>
											<Text style={summaryLabel}>Trip Distance</Text>
											<Text style={summaryValue}>
												{actualDistance
													? `${(actualDistance / 1000).toFixed(1)} km`
													: estimatedDistance
														? `${(estimatedDistance / 1000).toFixed(1)} km (estimated)`
														: "N/A"}
												{estimatedDistance && actualDistance && (
													<Text style={estimatedText}>
														{" "}
														(Est: {(estimatedDistance / 1000).toFixed(1)} km)
													</Text>
												)}
											</Text>
										</Column>
										<Column style={{ width: "50%" }}>
											<Text style={summaryLabel}>Total Amount</Text>
											<Text
												style={{
													...summaryValue,
													fontSize: "18px",
													fontWeight: "600",
													color: "#059669",
												}}
											>
												${finalAmount.toFixed(2)}
											</Text>
										</Column>
									</Row>
								</Section>

								{/* Fare Breakdown */}
								{((typeof baseFare === "number" && baseFare > 0) ||
									(typeof distanceFare === "number" && distanceFare > 0) ||
									(typeof extraCharges === "number" && extraCharges > 0)) && (
									<Section style={fareDetails}>
										<Text style={fareBreakdownSubtitle}>Fare Breakdown</Text>

										{typeof baseFare === "number" && baseFare > 0 && (
											<Row style={fareRow}>
												<Column style={{ width: "70%" }}>
													<Text style={fareLabel}>Base Fare</Text>
												</Column>
												<Column style={{ width: "30%", textAlign: "right" }}>
													<Text style={fareAmount}>${baseFare.toFixed(2)}</Text>
												</Column>
											</Row>
										)}

										{typeof distanceFare === "number" && distanceFare > 0 && (
											<Row style={fareRow}>
												<Column style={{ width: "70%" }}>
													<Text style={fareLabel}>Distance Fare</Text>
												</Column>
												<Column style={{ width: "30%", textAlign: "right" }}>
													<Text style={fareAmount}>
														${distanceFare.toFixed(2)}
													</Text>
												</Column>
											</Row>
										)}

										{typeof extraCharges === "number" && extraCharges > 0 && (
											<>
												<Row style={fareRow}>
													<Column style={{ width: "70%" }}>
														<Text style={fareLabel}>Additional Charges</Text>
													</Column>
													<Column style={{ width: "30%", textAlign: "right" }}>
														<Text style={fareAmount}>
															${extraCharges.toFixed(2)}
														</Text>
													</Column>
												</Row>
												{/* Detailed Extras Breakdown */}
												{extrasDetails && (
													<Section
														style={{
															marginTop: "8px",
															marginBottom: "12px",
															paddingLeft: "12px",
														}}
													>
														{typeof extrasDetails.additionalWaitTime ===
															"number" &&
															extrasDetails.additionalWaitTime > 0 && (
																<Row style={{ marginBottom: "4px" }}>
																	<Column style={{ width: "80%" }}>
																		<Text
																			style={{
																				fontSize: "12px",
																				color: "#64748b",
																			}}
																		>
																			• Additional wait time (
																			{extrasDetails.additionalWaitTime} min)
																		</Text>
																	</Column>
																</Row>
															)}
														{typeof extrasDetails.unscheduledStops ===
															"number" &&
															extrasDetails.unscheduledStops > 0 && (
																<Row style={{ marginBottom: "4px" }}>
																	<Column style={{ width: "80%" }}>
																		<Text
																			style={{
																				fontSize: "12px",
																				color: "#64748b",
																			}}
																		>
																			• Unscheduled stops (
																			{extrasDetails.unscheduledStops})
																		</Text>
																	</Column>
																</Row>
															)}
														{typeof extrasDetails.parkingCharges === "number" &&
															extrasDetails.parkingCharges > 0 && (
																<Row style={{ marginBottom: "4px" }}>
																	<Column style={{ width: "70%" }}>
																		<Text
																			style={{
																				fontSize: "12px",
																				color: "#64748b",
																			}}
																		>
																			• Parking charges
																		</Text>
																	</Column>
																	<Column
																		style={{ width: "30%", textAlign: "right" }}
																	>
																		<Text
																			style={{
																				fontSize: "12px",
																				color: "#64748b",
																			}}
																		>
																			${extrasDetails.parkingCharges.toFixed(2)}
																		</Text>
																	</Column>
																</Row>
															)}
														{typeof extrasDetails.tollCharges === "number" &&
															extrasDetails.tollCharges > 0 && (
																<Row style={{ marginBottom: "4px" }}>
																	<Column style={{ width: "70%" }}>
																		<Text
																			style={{
																				fontSize: "12px",
																				color: "#64748b",
																			}}
																		>
																			• Toll charges
																			{extrasDetails.tollLocation
																				? ` (${extrasDetails.tollLocation})`
																				: ""}
																		</Text>
																	</Column>
																	<Column
																		style={{ width: "30%", textAlign: "right" }}
																	>
																		<Text
																			style={{
																				fontSize: "12px",
																				color: "#64748b",
																			}}
																		>
																			${extrasDetails.tollCharges.toFixed(2)}
																		</Text>
																	</Column>
																</Row>
															)}
														{typeof extrasDetails.otherChargesAmount ===
															"number" &&
															extrasDetails.otherChargesAmount > 0 && (
																<Row style={{ marginBottom: "4px" }}>
																	<Column style={{ width: "70%" }}>
																		<Text
																			style={{
																				fontSize: "12px",
																				color: "#64748b",
																			}}
																		>
																			•{" "}
																			{extrasDetails.otherChargesDescription ||
																				"Other charges"}
																		</Text>
																	</Column>
																	<Column
																		style={{ width: "30%", textAlign: "right" }}
																	>
																		<Text
																			style={{
																				fontSize: "12px",
																				color: "#64748b",
																			}}
																		>
																			$
																			{extrasDetails.otherChargesAmount.toFixed(
																				2,
																			)}
																		</Text>
																	</Column>
																</Row>
															)}
													</Section>
												)}
											</>
										)}

										<Hr style={fareTotal} />
										<Row style={fareRow}>
											<Column style={{ width: "70%" }}>
												<Text style={fareTotalLabel}>Total</Text>
											</Column>
											<Column style={{ width: "30%", textAlign: "right" }}>
												<Text style={fareTotalAmount}>
													${finalAmount.toFixed(2)}
												</Text>
											</Column>
										</Row>
									</Section>
								)}

								<Text style={transparencyNote}>
									This breakdown shows how your fare was calculated for complete
									transparency.
									{/* Inline uniqueness */}
									<span style={{ fontSize: "0px", color: "transparent" }}>
										{" "}
										#{bookingReference}
									</span>
								</Text>
							</Section>
						)}

						{/* Simple CTA */}
						<Section style={ctaSection}>
							<Button style={ctaButton} href={`${websiteUrl}/my-bookings`}>
								View My Bookings
							</Button>
							<Text style={contactText}>
								Need help? Call{" "}
								<a href="tel:+61422693233" style={contactLink}>
									+61 422 693 233
								</a>
							</Text>
						</Section>
					</Section>

					{/* Compact Footer */}
					<Section style={footer}>
						<Text style={footerBrand}>Down Under Chauffeurs</Text>
						<Text style={footerDisclaimer}>
							Automated notification |{" "}
							<a href={`${websiteUrl}/contact-us`} style={footerLink}>
								Contact Support
							</a>
						</Text>
						{/* Anti-clipping measures */}
						<Text
							style={{
								fontSize: "1px",
								color: "#ffffff",
								lineHeight: "1px",
								opacity: 0,
								overflow: "hidden",
								display: "none",
							}}
						>
							Unique: {bookingReference}-{customerName.replace(/\s/g, "")}-
							{new Date().getTime().toString().slice(-6)}-
							{Math.random().toString(36).substr(2, 5)}
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

// Driver Trips Inspired Styles
const main = {
	fontFamily:
		"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
	border: "1px solid #e5e7eb",
};

const logoHeader = {
	padding: "16px 20px",
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

const contentHeader = {
	padding: "16px 20px 12px",
	background: "white",
	borderBottom: "1px solid #e5e7eb",
};

const headerTitle = {
	fontSize: "20px",
	fontWeight: "600",
	color: "#0f172a", // Darker for better contrast
	margin: "0 0 4px 0",
};

const headerSubtitle = {
	fontSize: "14px",
	color: "#475569", // Better contrast
	margin: "0",
	fontWeight: "400",
};

const statusBadge = {
	color: "white",
	fontSize: "12px",
	fontWeight: "600",
	padding: "4px 12px",
	borderRadius: "9999px",
	display: "inline-block",
	textTransform: "uppercase" as const,
	letterSpacing: "0.025em",
};

const tripCard = {
	background: "white",
	border: "1px solid #e5e7eb",
	borderLeftWidth: "4px",
	borderLeftStyle: "solid" as const,
	padding: "18px",
	margin: "0",
};

const tripHeader = {
	marginBottom: "16px",
};

const tripTime = {
	fontSize: "18px",
	fontWeight: "600",
	color: "#0f172a", // Darker for better contrast
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

const statusMessageSection = {
	padding: "16px",
	background: "#f0f9ff",
	border: "1px solid #bae6fd",
	borderRadius: "8px",
	marginBottom: "20px",
};

const statusText = {
	fontSize: "16px",
	color: "#0c4a6e",
	margin: "0",
};

// Removed unused route styles to reduce size

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
	color: "#0f172a", // Darker for better contrast
	margin: "0 0 12px 0",
	fontWeight: "500",
};

const detailSeparator = {
	border: "none",
	borderTop: "1px solid #e5e7eb",
	margin: "12px 0",
};

const ctaSection = {
	textAlign: "center" as const,
	margin: "20px 0 16px",
	padding: "16px",
	background: "#f8fafc",
	borderRadius: "8px",
};

const ctaButton = {
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

const contactText = {
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

// Fare Breakdown Styles
const fareBreakdownSection = {
	background: "#f0f9ff",
	border: "2px solid #0ea5e9",
	borderRadius: "8px",
	padding: "16px",
	margin: "16px 0",
};

const fareBreakdownTitle = {
	fontSize: "18px",
	fontWeight: "600",
	color: "#0c4a6e",
	margin: "0 0 16px 0",
	textAlign: "center" as const,
};

const fareBreakdownSubtitle = {
	fontSize: "14px",
	fontWeight: "600",
	color: "#475569",
	margin: "0 0 12px 0",
};

const tripSummary = {
	background: "white",
	borderRadius: "6px",
	padding: "12px",
	marginBottom: "12px",
	border: "1px solid #e2e8f0",
};

const summaryLabel = {
	fontSize: "12px",
	fontWeight: "600",
	color: "#64748b",
	margin: "0 0 4px 0",
};

const summaryValue = {
	fontSize: "14px",
	fontWeight: "500",
	color: "#0f172a",
	margin: "0 0 8px 0",
};

const estimatedText = {
	fontSize: "12px",
	color: "#64748b",
	fontStyle: "italic" as const,
};

const fareDetails = {
	background: "white",
	borderRadius: "8px",
	padding: "16px",
	marginBottom: "16px",
	border: "1px solid #e2e8f0",
};

const fareRow = {
	marginBottom: "8px",
};

const fareLabel = {
	fontSize: "14px",
	color: "#475569",
	margin: "0",
};

const fareAmount = {
	fontSize: "14px",
	fontWeight: "500",
	color: "#0f172a",
	margin: "0",
};

const fareTotal = {
	border: "none",
	borderTop: "2px solid #e2e8f0",
	margin: "12px 0 8px 0",
};

const fareTotalLabel = {
	fontSize: "16px",
	fontWeight: "600",
	color: "#0f172a",
	margin: "0",
};

const fareTotalAmount = {
	fontSize: "16px",
	fontWeight: "600",
	color: "#059669",
	margin: "0",
};

const transparencyNote = {
	fontSize: "12px",
	color: "#64748b",
	fontStyle: "italic" as const,
	textAlign: "center" as const,
	margin: "16px 0 0 0",
	lineHeight: "1.4",
};

export default TripStatusEmail;
