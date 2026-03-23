import { z } from "zod";
import type { DB } from "@/db";
import { bookingReviews } from "@/db/sqlite/schema/bookings/booking-reviews";
import { bookings } from "@/db/sqlite/schema/bookings";
import { eq, desc, inArray } from "drizzle-orm";

export const GetReviewsForCarSchema = z.object({
	carId: z.string().min(1),
	limit: z.number().min(1).max(50).optional().default(20),
	fallbackToCompany: z.boolean().optional().default(true),
});

export type GetReviewsForCarInput = z.infer<typeof GetReviewsForCarSchema>;

async function getCompanyReviews(db: DB, limit: number) {
	const allReviews = await db
		.select()
		.from(bookingReviews)
		.orderBy(desc(bookingReviews.createdAt));

	const totalCount = allReviews.length;
	const bookingIds = [...new Set(allReviews.map((r) => r.bookingId).filter(Boolean))];
	const bookingNames = new Map<string, string>();
	if (bookingIds.length > 0) {
		const bookingRows = await db
			.select({ id: bookings.id, customerName: bookings.customerName })
			.from(bookings)
			.where(inArray(bookings.id, bookingIds as string[]));
		for (const b of bookingRows) {
			bookingNames.set(b.id, b.customerName ?? "Customer");
		}
	}

	const avgService =
		totalCount > 0
			? allReviews.reduce((s, r) => s + (r.serviceRating ?? 0), 0) / totalCount
			: 0;
	const avgDriver =
		totalCount > 0
			? allReviews.reduce((s, r) => s + (r.driverRating ?? 0), 0) / totalCount
			: 0;
	const avgVehicle =
		totalCount > 0
			? allReviews.reduce((s, r) => s + (r.vehicleRating ?? 0), 0) / totalCount
			: 0;
	const averageRating =
		totalCount > 0 ? (avgService + avgDriver + avgVehicle) / 3 : 0;

	const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
	for (const r of allReviews) {
		const avg = (r.serviceRating + r.driverRating + r.vehicleRating) / 3;
		const rounded = Math.round(avg);
		if (rounded >= 1 && rounded <= 5) {
			ratingDistribution[rounded] = (ratingDistribution[rounded] ?? 0) + 1;
		}
	}

	const limited = allReviews.slice(0, limit);
	return {
		totalReviews: totalCount,
		averageRating: Math.round(averageRating * 10) / 10,
		ratingDistribution,
		reviews: limited.map((r) => ({
			id: r.id,
			bookingId: r.bookingId,
			author: bookingNames.get(r.bookingId ?? "") ?? "Customer",
			serviceRating: r.serviceRating,
			driverRating: r.driverRating,
			vehicleRating: r.vehicleRating,
			review: r.review,
			createdAt: r.createdAt,
			rating: Math.round(
				(r.serviceRating + r.driverRating + r.vehicleRating) / 3
			),
		})),
	};
}

export async function getReviewsForCarService(db: DB, input: GetReviewsForCarInput) {
	const { carId, limit, fallbackToCompany } = input;

	// Get booking IDs for this car
	const carBookings = await db
		.select({ id: bookings.id, customerName: bookings.customerName })
		.from(bookings)
		.where(eq(bookings.carId, carId));

	const bookingIds = carBookings.map((b) => b.id);
	const bookingMap = new Map(carBookings.map((b) => [b.id, b.customerName]));

	if (bookingIds.length === 0 && fallbackToCompany) {
		return getCompanyReviews(db, limit);
	}
	if (bookingIds.length === 0) {
		return {
			totalReviews: 0,
			averageRating: 0,
			ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
			reviews: [],
		};
	}

	const allReviews = await db
		.select()
		.from(bookingReviews)
		.where(inArray(bookingReviews.bookingId, bookingIds))
		.orderBy(desc(bookingReviews.createdAt));

	const totalCount = allReviews.length;
	const avgService =
		totalCount > 0
			? allReviews.reduce((s, r) => s + (r.serviceRating ?? 0), 0) / totalCount
			: 0;
	const avgDriver =
		totalCount > 0
			? allReviews.reduce((s, r) => s + (r.driverRating ?? 0), 0) / totalCount
			: 0;
	const avgVehicle =
		totalCount > 0
			? allReviews.reduce((s, r) => s + (r.vehicleRating ?? 0), 0) / totalCount
			: 0;
	const averageRating =
		totalCount > 0 ? (avgService + avgDriver + avgVehicle) / 3 : 0;

	const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
	for (const r of allReviews) {
		const avg = (r.serviceRating + r.driverRating + r.vehicleRating) / 3;
		const rounded = Math.round(avg);
		if (rounded >= 1 && rounded <= 5) {
			ratingDistribution[rounded] = (ratingDistribution[rounded] ?? 0) + 1;
		}
	}

	const limitedReviews = allReviews.slice(0, limit);

	return {
		totalReviews: totalCount,
		averageRating: Math.round(averageRating * 10) / 10,
		ratingDistribution,
		reviews: limitedReviews.map((r) => ({
			id: r.id,
			bookingId: r.bookingId,
			author: bookingMap.get(r.bookingId ?? "") ?? "Customer",
			serviceRating: r.serviceRating,
			driverRating: r.driverRating,
			vehicleRating: r.vehicleRating,
			review: r.review,
			createdAt: r.createdAt,
			rating: Math.round(
				(r.serviceRating + r.driverRating + r.vehicleRating) / 3
			),
		})),
	};
}
