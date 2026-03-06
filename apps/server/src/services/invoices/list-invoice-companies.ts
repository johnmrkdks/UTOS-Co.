import type { DB } from "@/db";
import { offloadBookingDetails, bookings } from "@/db/sqlite/schema";
import { eq, sql } from "drizzle-orm";
import { BookingStatusEnum } from "@/db/sqlite/enums";

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
