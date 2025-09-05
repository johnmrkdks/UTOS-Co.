import { z } from "zod";
import type { DB } from "@/db";
import { bookings } from "@/db/sqlite/schema/bookings";
import { packages } from "@/db/sqlite/schema/packages";
import { drivers } from "@/db/sqlite/schema/drivers";
import { and, gte, lte } from "drizzle-orm";

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
		
		// Calculate revenue metrics
		const totalRevenue = allBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
		const monthlyRevenue = allBookings
			.filter((b: any) => new Date(b.createdAt) >= startOfMonth)
			.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
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
			.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
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
				totalAmount: booking.totalAmount,
				createdAt: new Date(booking.createdAt),
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
		};
		
	} catch (error) {
		handleServiceError(error, "Failed to fetch dashboard analytics");
	}
}