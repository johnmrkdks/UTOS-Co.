import { eq, sql } from "drizzle-orm";
import type { DB } from "@/db";
import { BookingStatusEnum } from "@/db/sqlite/enums";
import { bookings, offloadBookingDetails } from "@/db/sqlite/schema";

/** Get distinct company names (offloaders) that have completed bookings */
export async function listInvoiceCompaniesService(db: DB) {
	const companies = await db
		.selectDistinct({
			companyName: offloadBookingDetails.offloaderName,
		})
		.from(offloadBookingDetails)
		.innerJoin(bookings, eq(offloadBookingDetails.bookingId, bookings.id))
		.where(eq(bookings.status, BookingStatusEnum.Completed))
		.orderBy(offloadBookingDetails.offloaderName);

	return companies.map((c) => c.companyName);
}
