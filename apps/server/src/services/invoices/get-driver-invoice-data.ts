import type { DB } from "@/db";
import { bookings, drivers, users, offloadBookingDetails } from "@/db/sqlite/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { BookingStatusEnum } from "@/db/sqlite/enums";

export const GetDriverInvoiceDataSchema = z.object({
	driverId: z.string().min(1, "Driver is required"),
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
	/** Admin override: commission % for this invoice (1-100). If omitted, uses driver's stored rate. */
	commissionRate: z.number().min(1).max(100).optional(),
});

export type GetDriverInvoiceDataInput = z.infer<typeof GetDriverInvoiceDataSchema>;

/** Extract suburb from Australian-style address (e.g. "123 Main St, Melbourne VIC 3000" -> "Melbourne") */
function extractSuburb(address: string): string {
	if (!address?.trim()) return address || "";
	// Match pattern: ", Suburb STATE Postcode" - suburb is before state
	const match = address.match(/,\s*([^,]+?)\s+(?:NSW|VIC|QLD|WA|SA|TAS|NT|ACT)\s+\d{4}/i);
	if (match) return match[1].trim();
	// Fallback: last comma-separated part before numbers (postcode)
	const parts = address.split(",").map((p) => p.trim());
	return parts.length >= 2 ? parts[parts.length - 2] : address;
}

export async function getDriverInvoiceDataService(db: DB, input: GetDriverInvoiceDataInput) {
	const { driverId, startDate, endDate, commissionRate: commissionRateOverride } = input;

	const startTs = Math.floor(startDate.getTime() / 1000);
	const endTs = Math.floor(endDate.getTime() / 1000);

	// Get driver with user info
	const [driver] = await db
		.select({
			id: drivers.id,
			commissionRate: drivers.commissionRate,
			user: {
				name: users.name,
				email: users.email,
			},
		})
		.from(drivers)
		.leftJoin(users, eq(drivers.userId, users.id))
		.where(eq(drivers.id, driverId))
		.limit(1);

	if (!driver) {
		throw new Error("Driver not found");
	}

	const commissionRate = commissionRateOverride ?? driver.commissionRate ?? 50;

	// Get completed bookings for driver in date range (use serviceCompletedAt or actualDropoffTime)
	const completedBookings = await db
		.select({
			id: bookings.id,
			referenceNumber: bookings.referenceNumber,
			bookingType: bookings.bookingType,
			originAddress: bookings.originAddress,
			destinationAddress: bookings.destinationAddress,
			actualDistance: bookings.actualDistance,
			estimatedDistance: bookings.estimatedDistance,
			quotedAmount: bookings.quotedAmount,
			finalAmount: bookings.finalAmount,
			extraCharges: bookings.extraCharges,
			scheduledPickupTime: bookings.scheduledPickupTime,
			jobType: offloadBookingDetails.jobType,
			vehicleType: offloadBookingDetails.vehicleType,
		})
		.from(bookings)
		.leftJoin(offloadBookingDetails, eq(bookings.id, offloadBookingDetails.bookingId))
		.where(
			and(
				eq(bookings.driverId, driverId),
				eq(bookings.status, BookingStatusEnum.Completed),
				sql`COALESCE(${bookings.serviceCompletedAt}, ${bookings.actualDropoffTime}, ${bookings.scheduledPickupTime}) >= ${startTs}`,
				sql`COALESCE(${bookings.serviceCompletedAt}, ${bookings.actualDropoffTime}, ${bookings.scheduledPickupTime}) <= ${endTs}`
			)
		)
		.orderBy(bookings.scheduledPickupTime);

	const jobs = completedBookings.map((b) => {
		const amount = b.finalAmount ?? b.quotedAmount ?? 0;
		const distance = b.actualDistance ?? b.estimatedDistance ?? 0;
		const transferType =
			b.bookingType === "offload"
				? `${b.jobType || "Transfer"} (${b.vehicleType || "Standard"})`
				: b.bookingType === "package"
					? "Package"
					: "Custom";
		const originSuburb = extractSuburb(b.originAddress ?? "");
		const destSuburb = extractSuburb(b.destinationAddress ?? "");

		const driverShare = (amount * commissionRate) / 100;

		return {
			referenceNumber: b.referenceNumber || b.id,
			transferType,
			distanceKm: distance,
			originSuburb: originSuburb || b.originAddress,
			destinationSuburb: destSuburb || b.destinationAddress,
			jobPrice: amount,
			driverShare,
			commissionRate,
			scheduledPickupTime: b.scheduledPickupTime,
		};
	});

	const totalJobPrice = jobs.reduce((sum, j) => sum + j.jobPrice, 0);
	const totalDriverShare = jobs.reduce((sum, j) => sum + j.driverShare, 0);

	return {
		driver: {
			id: driver.id,
			name: driver.user?.name ?? "Unknown",
			email: driver.user?.email ?? "",
			commissionRate,
		},
		period: { startDate, endDate },
		jobs,
		summary: {
			totalJobs: jobs.length,
			totalJobPrice,
			totalDriverShare,
		},
	};
}
