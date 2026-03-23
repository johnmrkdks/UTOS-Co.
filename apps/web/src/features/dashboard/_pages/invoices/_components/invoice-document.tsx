import { format } from "date-fns";
import { BUSINESS_INFO } from "@/constants/business-info";

const formatCurrency = (n: number) =>
	new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
		n,
	);

/** Hex colors for PDF export - html2pdf/html2canvas does not support oklch */
const colors = {
	teal800: "#155e75",
	teal600: "#0d9488",
	gray900: "#111827",
	gray700: "#374151",
	gray600: "#4b5563",
	gray500: "#6b7280",
	gray400: "#9ca3af",
	gray200: "#e5e7eb",
	gray100: "#f3f4f6",
	white: "#ffffff",
	black: "#000000",
} as const;

type DriverInvoiceData = {
	driver: { name: string; email: string; commissionRate: number };
	period: { startDate: Date | string; endDate: Date | string };
	jobs: Array<{
		referenceNumber: string;
		transferType: string;
		distanceKm?: number;
		originSuburb: string;
		destinationSuburb: string;
		jobPrice: number;
		driverShare: number;
	}>;
	summary: {
		totalJobs: number;
		totalJobPrice: number;
		totalDriverShare: number;
	};
};

type CompanyInvoiceData = {
	companyName: string;
	period: { startDate: Date | string; endDate: Date | string };
	jobs: Array<{
		referenceNumber: string;
		transferType: string;
		distanceKm?: number;
		originSuburb: string;
		destinationSuburb: string;
		price: number;
	}>;
	summary: {
		totalJobs: number;
		totalAmount: number;
	};
};

type InvoiceDocumentProps =
	| { type: "driver"; data: DriverInvoiceData }
	| { type: "company"; data: CompanyInvoiceData };

function toDate(d: Date | string): Date {
	return d instanceof Date ? d : new Date(d);
}

function generateInvoiceNumber(
	type: "driver" | "company",
	periodStart: Date | string,
	periodEnd: Date | string,
	identifier: string,
): string {
	const prefix = type === "driver" ? "DRV" : "CO";
	const dateStr = format(periodStart, "yyyyMMdd");
	const hash =
		Math.abs(identifier.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) %
		1000;
	return `INV-${prefix}-${dateStr}-${hash.toString().padStart(3, "0")}`;
}

export function InvoiceDocument(props: InvoiceDocumentProps) {
	const { type, data } = props;
	const invoiceDate = new Date();
	const startDate = toDate(data.period.startDate);
	const endDate = toDate(data.period.endDate);
	const invoiceNumber =
		type === "driver"
			? generateInvoiceNumber(type, startDate, endDate, data.driver.email)
			: generateInvoiceNumber(type, startDate, endDate, data.companyName);

	return (
		<div
			className="invoice-document mx-auto max-w-[210mm] print:max-w-none"
			style={{
				backgroundColor: colors.white,
				color: colors.black,
			}}
		>
			{/* Company letterhead */}
			<header
				style={{
					borderBottom: `2px solid ${colors.teal800}`,
					paddingBottom: 24,
					marginBottom: 32,
				}}
			>
				<h1
					style={{
						fontSize: "1.5rem",
						fontWeight: 700,
						color: colors.teal800,
						letterSpacing: "-0.025em",
					}}
				>
					{BUSINESS_INFO.business.name}
				</h1>
				<p
					style={{ fontSize: "0.875rem", color: colors.teal600, marginTop: 2 }}
				>
					{BUSINESS_INFO.business.slogan}
				</p>
				<div
					style={{
						marginTop: 16,
						display: "flex",
						flexWrap: "wrap",
						gap: "0 24px",
						fontSize: "0.875rem",
						color: colors.gray600,
					}}
				>
					<span>{BUSINESS_INFO.invoice.address}</span>
					<a href={BUSINESS_INFO.phone.link} style={{ color: colors.gray600 }}>
						{BUSINESS_INFO.phone.display}
					</a>
					<a href={BUSINESS_INFO.email.link} style={{ color: colors.gray600 }}>
						{BUSINESS_INFO.email.display}
					</a>
					{BUSINESS_INFO.invoice.abn && (
						<span>ABN: {BUSINESS_INFO.invoice.abn}</span>
					)}
				</div>
			</header>

			{/* Invoice title and metadata */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 8,
					marginBottom: 32,
				}}
			>
				<h2
					style={{
						fontSize: "1.25rem",
						fontWeight: 600,
						color: colors.gray900,
					}}
				>
					{type === "driver" ? "Driver Commission Invoice" : "Tax Invoice"}
				</h2>
				<p style={{ fontSize: "0.875rem", color: colors.gray500 }}>
					Invoice #{invoiceNumber}
				</p>
				<p style={{ fontSize: "0.875rem", color: colors.gray600 }}>
					<strong>Invoice date:</strong> {format(invoiceDate, "dd MMMM yyyy")}
				</p>
				<p style={{ fontSize: "0.875rem", color: colors.gray600 }}>
					<strong>Period:</strong> {format(startDate, "dd MMM yyyy")} –{" "}
					{format(endDate, "dd MMM yyyy")}
				</p>
			</div>

			{/* Bill to */}
			<div
				style={{
					marginBottom: 32,
					padding: 16,
					backgroundColor: colors.gray100,
					borderRadius: 8,
					border: `1px solid ${colors.gray200}`,
				}}
			>
				<p
					style={{
						fontSize: "0.75rem",
						fontWeight: 600,
						letterSpacing: "0.05em",
						color: colors.gray500,
						marginBottom: 8,
					}}
				>
					BILL TO
				</p>
				{type === "driver" ? (
					<p style={{ fontWeight: 500, color: colors.gray900 }}>
						{data.driver.name}
					</p>
				) : (
					<p style={{ fontWeight: 500, color: colors.gray900 }}>
						{data.companyName}
					</p>
				)}
			</div>

			{/* Line items table */}
			<div style={{ overflowX: "auto" }}>
				<table
					style={{
						width: "100%",
						fontSize: "0.875rem",
						borderCollapse: "collapse",
					}}
				>
					<thead>
						<tr style={{ borderBottom: `2px solid ${colors.gray200}` }}>
							<th
								style={{
									textAlign: "left",
									padding: "12px 8px",
									fontWeight: 600,
									color: colors.gray700,
								}}
							>
								Ref
							</th>
							<th
								style={{
									textAlign: "left",
									padding: "12px 8px",
									fontWeight: 600,
									color: colors.gray700,
								}}
							>
								Transfer type
							</th>
							<th
								style={{
									textAlign: "left",
									padding: "12px 8px",
									fontWeight: 600,
									color: colors.gray700,
								}}
							>
								Distance
							</th>
							<th
								style={{
									textAlign: "left",
									padding: "12px 8px",
									fontWeight: 600,
									color: colors.gray700,
								}}
							>
								Origin
							</th>
							<th
								style={{
									textAlign: "left",
									padding: "12px 8px",
									fontWeight: 600,
									color: colors.gray700,
								}}
							>
								Destination
							</th>
							<th
								style={{
									textAlign: "right",
									padding: "12px 8px",
									fontWeight: 600,
									color: colors.gray700,
								}}
							>
								{type === "driver" ? "Amount" : "Price"}
							</th>
						</tr>
					</thead>
					<tbody>
						{type === "driver"
							? data.jobs.map((job) => (
									<tr
										key={job.referenceNumber}
										style={{ borderBottom: `1px solid ${colors.gray200}` }}
									>
										<td
											style={{
												padding: "8px",
												fontFamily: "monospace",
												fontSize: "0.75rem",
											}}
										>
											{job.referenceNumber}
										</td>
										<td style={{ padding: "8px" }}>{job.transferType}</td>
										<td style={{ padding: "8px" }}>
											{job.distanceKm != null && job.distanceKm > 0
												? `${job.distanceKm.toFixed(1)} km`
												: "-"}
										</td>
										<td style={{ padding: "8px" }}>{job.originSuburb}</td>
										<td style={{ padding: "8px" }}>{job.destinationSuburb}</td>
										<td
											style={{
												padding: "8px",
												textAlign: "right",
												fontWeight: 500,
											}}
										>
											{formatCurrency(job.driverShare)}
										</td>
									</tr>
								))
							: data.jobs.map((job) => (
									<tr
										key={job.referenceNumber}
										style={{ borderBottom: `1px solid ${colors.gray200}` }}
									>
										<td
											style={{
												padding: "8px",
												fontFamily: "monospace",
												fontSize: "0.75rem",
											}}
										>
											{job.referenceNumber}
										</td>
										<td style={{ padding: "8px" }}>{job.transferType}</td>
										<td style={{ padding: "8px" }}>
											{job.distanceKm != null && job.distanceKm > 0
												? `${job.distanceKm.toFixed(1)} km`
												: "-"}
										</td>
										<td style={{ padding: "8px" }}>{job.originSuburb}</td>
										<td style={{ padding: "8px" }}>{job.destinationSuburb}</td>
										<td style={{ padding: "8px", textAlign: "right" }}>
											{formatCurrency(job.price)}
										</td>
									</tr>
								))}
					</tbody>
				</table>
			</div>

			{/* Totals */}
			<div
				style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}
			>
				<div style={{ width: "100%", maxWidth: 320 }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							fontSize: "0.875rem",
							color: colors.gray600,
						}}
					>
						<span>Total jobs:</span>
						<span>{data.summary.totalJobs}</span>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							fontSize: "1.125rem",
							fontWeight: 700,
							paddingTop: 8,
							marginTop: 8,
							borderTop: `2px solid ${colors.gray200}`,
						}}
					>
						<span>Amount due:</span>
						<span>
							{type === "driver"
								? formatCurrency(data.summary.totalDriverShare)
								: formatCurrency(data.summary.totalAmount)}
						</span>
					</div>
				</div>
			</div>

			{/* Payment terms and footer */}
			<footer
				style={{
					marginTop: 48,
					paddingTop: 24,
					borderTop: `1px solid ${colors.gray200}`,
					fontSize: "0.75rem",
					color: colors.gray500,
				}}
			>
				<p>{BUSINESS_INFO.invoice.paymentTerms}</p>
				{BUSINESS_INFO.invoice.bankDetails && (
					<p>Bank details: {BUSINESS_INFO.invoice.bankDetails}</p>
				)}
				<p style={{ marginTop: 16 }}>
					Thank you for your business. For queries, contact{" "}
					{BUSINESS_INFO.email.display} or {BUSINESS_INFO.phone.display}.
				</p>
				<p style={{ marginTop: 8, color: colors.gray400 }}>
					{BUSINESS_INFO.business.name}
					{BUSINESS_INFO.invoice.abn
						? ` • ABN: ${BUSINESS_INFO.invoice.abn}`
						: ""}{" "}
					• {BUSINESS_INFO.invoice.address}
				</p>
			</footer>
		</div>
	);
}
