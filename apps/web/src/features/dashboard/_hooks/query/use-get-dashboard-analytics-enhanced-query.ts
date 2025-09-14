import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetDashboardAnalyticsEnhancedQuery = () => {
	return useQuery(trpc.analytics.getDashboardAnalytics.queryOptions({}));
};

// Helper to format analytics data for display
export const formatDashboardAnalytics = (analytics: any) => {
	if (!analytics) {
		return {
			stats: {
				totalBookings: 0,
				activeBookings: 0,
				totalRevenue: 0,
				monthlyRevenue: 0,
				totalPackages: 0,
				activePackages: 0,
				totalDrivers: 0,
				activeDrivers: 0,
				avgRating: 4.8, // Mock until ratings system is implemented
				completionRate: 0,
				totalReviews: 0, // Mock
			},
			recentActivity: [],
		};
	}

	// Convert backend analytics to frontend display format
	const stats = {
		totalBookings: analytics.totalBookings,
		activeBookings: analytics.activeBookings,
		pendingBookings: analytics.pendingBookings,
		completedBookings: analytics.completedBookings,
		
		// Revenue (convert from cents to dollars for calculations, but keep cents for accuracy)
		totalRevenue: analytics.totalRevenue,
		monthlyRevenue: analytics.monthlyRevenue,
		averageBookingValue: analytics.averageBookingValue,
		
		// Packages
		totalPackages: analytics.totalPackages,
		activePackages: analytics.activePackages,
		publishedPackages: analytics.publishedPackages,
		
		// Drivers
		totalDrivers: analytics.totalDrivers,
		activeDrivers: analytics.activeDrivers,
		pendingDrivers: analytics.pendingDrivers,
		
		// Performance
		completionRate: analytics.completionRate,
		cancellationRate: analytics.cancellationRate,
		
		// Mock data for features not yet implemented
		avgRating: 4.8,
		totalReviews: Math.max(analytics.completedBookings * 0.7, 0), // Assume 70% of completed bookings have reviews
		
		// Growth metrics
		bookingGrowth: analytics.bookingGrowth,
		revenueGrowth: analytics.revenueGrowth,
	};

	// Format recent activity
	const recentActivity = analytics.recentBookings?.map((booking: any) => ({
		id: booking.id,
		type: booking.bookingType,
		title: booking.bookingType === "package" 
			? `Package booking for ${booking.customerName || "Customer"}`
			: `Custom booking for ${booking.customerName || "Customer"}`,
		description: booking.originAddress && booking.destinationAddress
			? `${booking.originAddress}${booking.stops && booking.stops.length > 0 ? ` (${booking.stops.length} stop${booking.stops.length > 1 ? 's' : ''})` : ''} → ${booking.destinationAddress}`
			: "Booking details",
		time: formatTimeAgo(new Date(booking.createdAt)),
		status: booking.status,
		amount: (booking.totalAmount || 0) / 100, // Convert from cents to dollars
	})) || [];

	return {
		stats,
		recentActivity,
		growth: {
			bookings: analytics.bookingGrowth,
			revenue: analytics.revenueGrowth,
		},
	};
};

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
	
	if (diffInMinutes < 1) return "Just now";
	if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
	
	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return `${diffInHours}h ago`;
	
	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) return `${diffInDays}d ago`;
	
	return date.toLocaleDateString();
}