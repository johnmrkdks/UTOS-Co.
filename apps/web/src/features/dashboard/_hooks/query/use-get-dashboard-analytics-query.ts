import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useGetDashboardAnalyticsQuery = () => {
	const bookingsQuery = useQuery(trpc.bookings.list.queryOptions({ 
		limit: 1000, // Get all bookings for accurate stats
		sortBy: "createdAt",
		sortOrder: "desc"
	}));

	const packagesQuery = useQuery(trpc.packages.list.queryOptions({ 
		limit: 1000, // Get all packages for accurate stats
		sortBy: "createdAt",
		sortOrder: "desc"
	}));

	const driversQuery = useQuery(trpc.drivers.list.queryOptions({ 
		limit: 1000, // Get all drivers for accurate stats
		sortBy: "createdAt", 
		sortOrder: "desc"
	}));

	// Calculate dashboard statistics from real data
	const dashboardStats = {
		// Bookings metrics
		totalBookings: bookingsQuery.data?.items?.length || 0,
		activeBookings: bookingsQuery.data?.items?.filter(booking => 
			booking.status === "confirmed" || 
			booking.status === "driver_assigned" || 
			booking.status === "in_progress"
		).length || 0,
		pendingBookings: bookingsQuery.data?.items?.filter(booking => 
			booking.status === "pending"
		).length || 0,
		completedBookings: bookingsQuery.data?.items?.filter(booking => 
			booking.status === "completed"
		).length || 0,

		// Revenue metrics (in cents, convert for display)
		totalRevenue: bookingsQuery.data?.items?.reduce((total, booking) => 
			total + (booking.totalAmount || 0), 0) || 0,
		monthlyRevenue: bookingsQuery.data?.items
			?.filter(booking => {
				const bookingDate = new Date(booking.createdAt);
				const currentDate = new Date();
				return bookingDate.getMonth() === currentDate.getMonth() && 
					   bookingDate.getFullYear() === currentDate.getFullYear();
			})
			?.reduce((total, booking) => total + (booking.totalAmount || 0), 0) || 0,

		// Package metrics
		totalPackages: packagesQuery.data?.items?.length || 0,
		activePackages: packagesQuery.data?.items?.filter(pkg => 
			pkg.isPublished && pkg.isAvailable
		).length || 0,

		// Driver metrics
		totalDrivers: driversQuery.data?.items?.length || 0,
		activeDrivers: driversQuery.data?.items?.filter(driver => 
			driver.status === "active"
		).length || 0,
		pendingDrivers: driversQuery.data?.items?.filter(driver => 
			driver.status === "pending_approval"
		).length || 0,

		// Performance metrics
		completionRate: bookingsQuery.data?.items?.length ? 
			Math.round((bookingsQuery.data.items.filter(booking => 
				booking.status === "completed"
			).length / bookingsQuery.data.items.length) * 100) : 0,
		
		// Calculate average rating (mock for now until ratings are implemented)
		avgRating: 4.8,
		totalReviews: 247, // Mock data
	};

	// Recent activity from real bookings data
	const recentActivity = bookingsQuery.data?.items
		?.slice(0, 5) // Get 5 most recent
		?.map(booking => ({
			id: booking.id,
			type: booking.bookingType === "package" ? "package" : "custom",
			title: booking.bookingType === "package" 
				? `Package booking for ${booking.customerName || "Customer"}`
				: `Custom booking for ${booking.customerName || "Customer"}`,
			description: booking.originAddress && booking.destinationAddress
				? `${booking.originAddress} → ${booking.destinationAddress}`
				: "Booking details",
			time: formatTimeAgo(new Date(booking.createdAt)),
			status: booking.status || "pending",
			amount: (booking.totalAmount || 0) / 100, // Convert from cents to dollars
		})) || [];

	return {
		data: {
			stats: dashboardStats,
			recentActivity,
		},
		isLoading: bookingsQuery.isLoading || packagesQuery.isLoading || driversQuery.isLoading,
		error: bookingsQuery.error || packagesQuery.error || driversQuery.error,
		refetch: () => {
			bookingsQuery.refetch();
			packagesQuery.refetch();
			driversQuery.refetch();
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