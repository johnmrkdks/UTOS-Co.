import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { useGetBookingsQuery } from "../_hooks/query/use-get-bookings-query";
import type { BookingFilters } from "./booking-filters";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useMemo } from "react";
import { format } from "date-fns";

interface BookingRevenueReportProps {
	filters?: BookingFilters;
}

export function BookingRevenueReport({ filters }: BookingRevenueReportProps) {
	const bookingsQuery = useGetBookingsQuery({
		limit: 1000, // Get all bookings for accurate reporting
	});

	const revenueMetrics = useMemo(() => {
		if (!bookingsQuery.data?.data) return null;

		let bookings = bookingsQuery.data.data;

		// Apply filters
		if (filters) {
			if (filters.status) {
				bookings = bookings.filter(b => b.status === filters.status);
			}
			if (filters.bookingType) {
				bookings = bookings.filter(b => b.bookingType === filters.bookingType);
			}
			if (filters.customerName) {
				bookings = bookings.filter(b => 
					b.customerName.toLowerCase().includes(filters.customerName!.toLowerCase())
				);
			}
			if (filters.dateFrom) {
				const fromDate = new Date(filters.dateFrom);
				bookings = bookings.filter(b => new Date(b.scheduledPickupTime) >= fromDate);
			}
			if (filters.dateTo) {
				const toDate = new Date(filters.dateTo);
				toDate.setHours(23, 59, 59, 999);
				bookings = bookings.filter(b => new Date(b.scheduledPickupTime) <= toDate);
			}
			if (filters.minAmount) {
				bookings = bookings.filter(b => (b.quotedAmount / 100) >= filters.minAmount!);
			}
			if (filters.maxAmount) {
				bookings = bookings.filter(b => (b.quotedAmount / 100) <= filters.maxAmount!);
			}
		}

		// Calculate metrics
		const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.quotedAmount || 0), 0) / 100;
		const completedBookings = bookings.filter(b => b.status === "completed");
		const confirmedRevenue = completedBookings.reduce((sum, booking) => sum + (booking.quotedAmount || 0), 0) / 100;
		const pendingRevenue = bookings
			.filter(b => ["pending", "confirmed", "driver_assigned", "in_progress"].includes(b.status))
			.reduce((sum, booking) => sum + (booking.quotedAmount || 0), 0) / 100;

		// Revenue by type
		const packageRevenue = bookings
			.filter(b => b.bookingType === "package")
			.reduce((sum, booking) => sum + (booking.quotedAmount || 0), 0) / 100;
		const customRevenue = bookings
			.filter(b => b.bookingType === "custom")
			.reduce((sum, booking) => sum + (booking.quotedAmount || 0), 0) / 100;

		// Average booking value
		const averageBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

		return {
			totalRevenue,
			confirmedRevenue,
			pendingRevenue,
			packageRevenue,
			customRevenue,
			averageBookingValue,
			totalBookings: bookings.length,
			completedBookings: completedBookings.length,
		};
	}, [bookingsQuery.data?.data, filters]);

	if (bookingsQuery.isLoading) {
		return <div className="text-center py-8">Loading revenue data...</div>;
	}

	if (bookingsQuery.error) {
		return <div className="text-center py-8 text-red-500">Error loading revenue data: {bookingsQuery.error.message}</div>;
	}

	if (!revenueMetrics) {
		return <div className="text-center py-8">No data available</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Revenue Analysis</h3>
				<Badge variant="outline">
					{revenueMetrics.totalBookings} booking{revenueMetrics.totalBookings !== 1 ? 's' : ''}
				</Badge>
			</div>

			{/* Revenue Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${revenueMetrics.totalRevenue.toFixed(2)}
						</div>
						<p className="text-xs text-muted-foreground">
							From all bookings
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Confirmed Revenue</CardTitle>
						<TrendingUp className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							${revenueMetrics.confirmedRevenue.toFixed(2)}
						</div>
						<p className="text-xs text-muted-foreground">
							{revenueMetrics.completedBookings} completed bookings
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
						<Calendar className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-yellow-600">
							${revenueMetrics.pendingRevenue.toFixed(2)}
						</div>
						<p className="text-xs text-muted-foreground">
							{revenueMetrics.totalBookings - revenueMetrics.completedBookings} pending bookings
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
						<TrendingDown className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${revenueMetrics.averageBookingValue.toFixed(2)}
						</div>
						<p className="text-xs text-muted-foreground">
							Per booking average
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Revenue by Type */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Package Bookings</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Revenue</span>
								<span className="font-medium">${revenueMetrics.packageRevenue.toFixed(2)}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Percentage</span>
								<span className="font-medium">
									{revenueMetrics.totalRevenue > 0 
										? ((revenueMetrics.packageRevenue / revenueMetrics.totalRevenue) * 100).toFixed(1)
										: 0
									}%
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Custom Bookings</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Revenue</span>
								<span className="font-medium">${revenueMetrics.customRevenue.toFixed(2)}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Percentage</span>
								<span className="font-medium">
									{revenueMetrics.totalRevenue > 0 
										? ((revenueMetrics.customRevenue / revenueMetrics.totalRevenue) * 100).toFixed(1)
										: 0
									}%
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Profit Analysis Note */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Profit Analysis</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						To enable comprehensive profit analysis, integrate cost tracking for:
					</p>
					<ul className="mt-2 text-sm text-muted-foreground space-y-1">
						<li>• Driver commissions and payments</li>
						<li>• Vehicle maintenance and fuel costs</li>
						<li>• Platform operational expenses</li>
						<li>• Marketing and acquisition costs</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}