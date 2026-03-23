import type { DB } from "@/db";
import { bookings, offloadBookingDetails } from "@/db/sqlite/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { BookingStatusEnum } from "@/db/sqlite/enums";

export const GetCompanyInvoiceDataSchema = z.object({
	companyName: z.string().min(1, "Company is required"),
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
});

export type GetCompanyInvoiceDataInput = z.infer<typeof GetCompanyInvoiceDataSchema>;

/** Extract suburb from Australian-style address */
function extractSuburb(address: string): string {
	if (!address?.trim()) return address || "";
	const match = address.match(/,\s*([^,]+?)\s+(?:NSW|VIC|QLD|WA|SA|TAS|NT|ACT)\s+\d{4}/i);
	if (match) return match[1].trim();
	const parts = address.split(",").map((p) => p.trim());
	return parts.length >= 2 ? parts[parts.length - 2] : address;
}

export async function getCompanyInvoiceDataService(db: DB, input: GetCompanyInvoiceDataInput) {
	const { companyName, startDate, endDate } = input;

	const startTs = Math.floor(startDate.getTime() / 1000);
	const endTs = Math.floor(endDate.getTime() / 1000);

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
			scheduledPickupTime: bookings.scheduledPickupTime,
			jobType: offloadBookingDetails.jobType,
			vehicleType: offloadBookingDetails.vehicleType,
		})
		.from(bookings)
		.innerJoin(offloadBookingDetails, eq(bookings.id, offloadBookingDetails.bookingId))
		.where(
			and(
				eq(offloadBookingDetails.offloaderName, companyName),
				eq(bookings.status, BookingStatusEnum.Completed),
				sql`COALESCE(${bookings.serviceCompletedAt}, ${bookings.actualDropoffTime}, ${bookings.scheduledPickupTime}) >= ${startTs}`,
				sql`COALESCE(${bookings.serviceCompletedAt}, ${bookings.actualDropoffTime}, ${bookings.scheduledPickupTime}) <= ${endTs}`
			)
		)
		.orderBy(bookings.scheduledPickupTime);

	const jobs = completedBookings.map((b) => {
		const amount = b.finalAmount ?? b.quotedAmount ?? 0;
		const distance = b.actualDistance ?? b.estimatedDistance ?? 0;
		const transferType = `${b.jobType || "Transfer"} (${b.vehicleType || "Standard"})`;
		const originSuburb = extractSuburb(b.originAddress ?? "");
		const destSuburb = extractSuburb(b.destinationAddress ?? "");

		return {
			referenceNumber: b.referenceNumber || b.id,
			transferType,
			distanceKm: distance,
			originSuburb: originSuburb || b.originAddress,
			destinationSuburb: destSuburb || b.destinationAddress,
			price: amount,
			scheduledPickupTime: b.scheduledPickupTime,
		};
	});

	const totalAmount = jobs.reduce((sum, j) => sum + j.price, 0);

	return {
		companyName,
		period: { startDate, endDate },
		jobs,
		summary: {
			totalJobs: jobs.length,
			totalAmount,
		},
	};
}
