import { z } from "zod";
import type { DB } from "@/db";
import { bookings } from "@/db/sqlite/schema/bookings";
import { packages } from "@/db/sqlite/schema/packages";
import { drivers } from "@/db/sqlite/schema/drivers";
import { bookingReviews } from "@/db/sqlite/schema/bookings/booking-reviews";
import { and, gte, lte, eq } from "drizzle-orm";

// Error handler since we can't find the original one
function handleServiceError(error: unknown, message: string): never {
	console.error(message, error);
	throw new Error(message);
}

export const GetDashboardAnalyticsServiceSchema = z.object({
	dateRange: z.object({
		start: z.coerce.date().optional(),
		end: z.coerce.date().optional(),
	}).optional(),
});

export type GetDashboardAnalyticsServiceInput = z.infer<typeof GetDashboardAnalyticsServiceSchema>;

export interface DashboardAnalytics {
	// Booking metrics
	totalBookings: number;
	activeBookings: number;
	pendingBookings: number;
	completedBookings: number;
	cancelledBookings: number;
	
	// Revenue metrics (in cents)
	totalRevenue: number;
	monthlyRevenue: number;
	averageBookingValue: number;
	
	// Package metrics
	totalPackages: number;
	activePackages: number;
	publishedPackages: number;
	
	// Driver metrics
	totalDrivers: number;
	activeDrivers: number;
	pendingDrivers: number;
	
	// Performance metrics
	completionRate: number;
	cancellationRate: number;
	
	// Growth metrics
	bookingGrowth: {
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
	
	revenueGrowth: {
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
	
	// Recent activity
	recentBookings: Array<{
		id: string;
		bookingType: "package" | "custom";
		customerName: string | null;
		originAddress: string | null;
		destinationAddress: string | null;
		status: string;
		totalAmount: number | null;
		createdAt: Date;
	}>;

	// Revenue by booking type (real data)
	revenueByType: {
		package: { revenue: number; count: number };
		custom: { revenue: number; count: number };
		offload: { revenue: number; count: number };
	};

	// Reviews (from booking_reviews)
	reviews: {
		totalReviews: number;
		averageRating: number;
		ratingDistribution: Record<number, number>;
		recentReviews: Array<{
			id: string;
			bookingId: string | null;
			serviceRating: number;
			driverRating: number;
			vehicleRating: number;
			review: string | null;
			createdAt: Date;
		}>;
	};
}

export async function getDashboardAnalyticsService(
	db: DB,
	input: GetDashboardAnalyticsServiceInput = {}
): Promise<DashboardAnalytics> {
	try {
		const { dateRange } = input;
		
		// Date filters
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
		
		// Build where conditions for bookings
		const bookingConditions = [];
		if (dateRange?.start) {
			bookingConditions.push(gte(bookings.createdAt, dateRange.start));
		}
		if (dateRange?.end) {
			bookingConditions.push(lte(bookings.createdAt, dateRange.end));
		}
		
		// Fetch all bookings with optional date filtering
		const allBookings = await db
			.select()
			.from(bookings)
			.where(bookingConditions.length > 0 ? and(...bookingConditions) : undefined);
		
		// Fetch packages
		const allPackages = await db.select().from(packages);
		
		// Fetch drivers
		const allDrivers = await db.select().from(drivers);
		
		// Calculate booking metrics
		const totalBookings = allBookings.length;
		const activeBookings = allBookings.filter((b: any) => 
			b.status === "confirmed" || 
			b.status === "driver_assigned" || 
			b.status === "in_progress"
		).length;
		const pendingBookings = allBookings.filter((b: any) => b.status === "pending").length;
		const completedBookings = allBookings.filter((b: any) => b.status === "completed").length;
		const cancelledBookings = allBookings.filter((b: any) => b.status === "cancelled").length;
		
		// Calculate revenue metrics (use finalAmount or quotedAmount - both in dollars)
		const getAmount = (b: any) => (b.finalAmount ?? b.quotedAmount ?? 0) * 100; // Convert to cents for consistency
		const totalRevenue = allBookings.reduce((sum: number, b: any) => sum + getAmount(b), 0);
		const monthlyRevenue = allBookings
			.filter((b: any) => new Date(b.createdAt) >= startOfMonth)
			.reduce((sum: number, b: any) => sum + getAmount(b), 0);
		const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
		
		// Calculate package metrics
		const totalPackages = allPackages.length;
		const activePackages = allPackages.filter((p: any) => p.isAvailable).length;
		const publishedPackages = allPackages.filter((p: any) => p.isPublished).length;
		
		// Calculate driver metrics
		const totalDrivers = allDrivers.length;
		const activeDrivers = allDrivers.filter((d: any) => d.status === "active").length;
		const pendingDrivers = allDrivers.filter((d: any) => d.status === "pending_approval").length;
		
		// Calculate performance metrics
		const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
		const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;
		
		// Calculate growth metrics
		const thisMonthBookings = allBookings.filter((b: any) => new Date(b.createdAt) >= startOfMonth).length;
		const lastMonthBookings = allBookings.filter((b: any) => {
			const bookingDate = new Date(b.createdAt);
			return bookingDate >= startOfLastMonth && bookingDate <= endOfLastMonth;
		}).length;
		const bookingGrowth = lastMonthBookings > 0 
			? Math.round(((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100)
			: thisMonthBookings > 0 ? 100 : 0;
		
		const lastMonthRevenue = allBookings
			.filter((b: any) => {
				const bookingDate = new Date(b.createdAt);
				return bookingDate >= startOfLastMonth && bookingDate <= endOfLastMonth;
			})
			.reduce((sum: number, b: any) => sum + getAmount(b), 0);
		const revenueGrowth = lastMonthRevenue > 0 
			? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
			: monthlyRevenue > 0 ? 100 : 0;
		
		// Get recent bookings (last 5)
		const recentBookings = allBookings
			.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 5)
			.map((booking: any) => ({
				id: booking.id,
				bookingType: booking.bookingType as "package" | "custom",
				customerName: booking.customerName,
				originAddress: booking.originAddress,
				destinationAddress: booking.destinationAddress,
				status: booking.status || "pending",
				totalAmount: (booking.finalAmount ?? booking.quotedAmount ?? 0) * 100, // cents
				createdAt: new Date(booking.createdAt),
			}));

		// Revenue by booking type (real data from bookings)
		const packageBookings = allBookings.filter((b: any) => b.bookingType === "package");
		const customBookings = allBookings.filter((b: any) => b.bookingType === "custom");
		const offloadBookings = allBookings.filter((b: any) => b.bookingType === "offload");

		const revenueByType = {
			package: {
				revenue: packageBookings.reduce((sum: number, b: any) => sum + getAmount(b), 0),
				count: packageBookings.length,
			},
			custom: {
				revenue: customBookings.reduce((sum: number, b: any) => sum + getAmount(b), 0),
				count: customBookings.length,
			},
			offload: {
				revenue: offloadBookings.reduce((sum: number, b: any) => sum + getAmount(b), 0),
				count: offloadBookings.length,
			},
		};

		// Reviews from booking_reviews
		const allReviews = await db.select().from(bookingReviews);
		const totalReviews = allReviews.length;
		const avgService = totalReviews > 0
			? allReviews.reduce((s, r) => s + (r.serviceRating ?? 0), 0) / totalReviews
			: 0;
		const avgDriver = totalReviews > 0
			? allReviews.reduce((s, r) => s + (r.driverRating ?? 0), 0) / totalReviews
			: 0;
		const avgVehicle = totalReviews > 0
			? allReviews.reduce((s, r) => s + (r.vehicleRating ?? 0), 0) / totalReviews
			: 0;
		const averageRating = totalReviews > 0
			? (avgService + avgDriver + avgVehicle) / 3
			: 0;

		const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		for (const r of allReviews) {
			const avg = (r.serviceRating + r.driverRating + r.vehicleRating) / 3;
			const rounded = Math.round(avg);
			if (rounded >= 1 && rounded <= 5) {
				ratingDistribution[rounded] = (ratingDistribution[rounded] ?? 0) + 1;
			}
		}

		const recentReviews = allReviews
			.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 5)
			.map((r: any) => ({
				id: r.id,
				bookingId: r.bookingId,
				serviceRating: r.serviceRating,
				driverRating: r.driverRating,
				vehicleRating: r.vehicleRating,
				review: r.review,
				createdAt: new Date(r.createdAt),
			}));
		
		return {
			// Booking metrics
			totalBookings,
			activeBookings,
			pendingBookings,
			completedBookings,
			cancelledBookings,
			
			// Revenue metrics
			totalRevenue,
			monthlyRevenue,
			averageBookingValue: Math.round(averageBookingValue),
			
			// Package metrics
			totalPackages,
			activePackages,
			publishedPackages,
			
			// Driver metrics
			totalDrivers,
			activeDrivers,
			pendingDrivers,
			
			// Performance metrics
			completionRate,
			cancellationRate,
			
			// Growth metrics
			bookingGrowth: {
				thisMonth: thisMonthBookings,
				lastMonth: lastMonthBookings,
				growth: bookingGrowth,
			},
			
			revenueGrowth: {
				thisMonth: monthlyRevenue,
				lastMonth: lastMonthRevenue,
				growth: revenueGrowth,
			},
			
			// Recent activity
			recentBookings,

			// Revenue by type
			revenueByType,

			// Reviews
			reviews: {
				totalReviews,
				averageRating: Math.round(averageRating * 10) / 10,
				ratingDistribution,
				recentReviews,
			},
		};
		
	} catch (error) {
		handleServiceError(error, "Failed to fetch dashboard analytics");
	}
}