import { Badge } from "@workspace/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { format } from "date-fns";
import { Calendar, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useGetBookingsQuery } from "../_hooks/query/use-get-bookings-query";
import type { BookingFilters } from "./booking-filters";

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
				bookings = bookings.filter((b) => b.status === filters.status);
			}
			if (filters.bookingType) {
				bookings = bookings.filter(
					(b) => b.bookingType === filters.bookingType,
				);
			}
			if (filters.customerName) {
				bookings = bookings.filter((b) =>
					b.customerName
						.toLowerCase()
						.includes(filters.customerName!.toLowerCase()),
				);
			}
			if (filters.dateFrom) {
				const fromDate = new Date(filters.dateFrom);
				bookings = bookings.filter(
					(b) => new Date(b.scheduledPickupTime) >= fromDate,
				);
			}
			if (filters.dateTo) {
				const toDate = new Date(filters.dateTo);
				toDate.setHours(23, 59, 59, 999);
				bookings = bookings.filter(
					(b) => new Date(b.scheduledPickupTime) <= toDate,
				);
			}
			if (filters.minAmount) {
				bookings = bookings.filter((b) => b.quotedAmount >= filters.minAmount!);
			}
			if (filters.maxAmount) {
				bookings = bookings.filter((b) => b.quotedAmount <= filters.maxAmount!);
			}
		}

		// Calculate metrics
		const totalRevenue = bookings.reduce(
			(sum, booking) => sum + (booking.quotedAmount || 0),
			0,
		);
		const completedBookings = bookings.filter((b) => b.status === "completed");
		const confirmedRevenue = completedBookings.reduce(
			(sum, booking) => sum + (booking.quotedAmount || 0),
			0,
		);
		const pendingRevenue = bookings
			.filter((b) =>
				["pending", "confirmed", "driver_assigned", "in_progress"].includes(
					b.status,
				),
			)
			.reduce((sum, booking) => sum + (booking.quotedAmount || 0), 0);

		// Revenue by type
		const packageRevenue = bookings
			.filter((b) => b.bookingType === "package")
			.reduce((sum, booking) => sum + (booking.quotedAmount || 0), 0);
		const customRevenue = bookings
			.filter((b) => b.bookingType === "custom")
			.reduce((sum, booking) => sum + (booking.quotedAmount || 0), 0);

		// Average booking value
		const averageBookingValue =
			bookings.length > 0 ? totalRevenue / bookings.length : 0;

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
		return <div className="py-8 text-center">Loading revenue data...</div>;
	}

	if (bookingsQuery.error) {
		return (
			<div className="py-8 text-center text-red-500">
				Error loading revenue data: {bookingsQuery.error.message}
			</div>
		);
	}

	if (!revenueMetrics) {
		return <div className="py-8 text-center">No data available</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-lg">Revenue Analysis</h3>
				<Badge variant="outline">
					{revenueMetrics.totalBookings} booking
					{revenueMetrics.totalBookings !== 1 ? "s" : ""}
				</Badge>
			</div>

			{/* Revenue Overview */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							${revenueMetrics.totalRevenue.toFixed(2)}
						</div>
						<p className="text-muted-foreground text-xs">From all bookings</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Confirmed Revenue
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-green-600">
							${revenueMetrics.confirmedRevenue.toFixed(2)}
						</div>
						<p className="text-muted-foreground text-xs">
							{revenueMetrics.completedBookings} completed bookings
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Pending Revenue
						</CardTitle>
						<Calendar className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-yellow-600">
							${revenueMetrics.pendingRevenue.toFixed(2)}
						</div>
						<p className="text-muted-foreground text-xs">
							{revenueMetrics.totalBookings - revenueMetrics.completedBookings}{" "}
							pending bookings
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Avg. Booking Value
						</CardTitle>
						<TrendingDown className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							${revenueMetrics.averageBookingValue.toFixed(2)}
						</div>
						<p className="text-muted-foreground text-xs">Per booking average</p>
					</CardContent>
				</Card>
			</div>

			{/* Revenue by Type */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Package Bookings</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">Revenue</span>
								<span className="font-medium">
									${revenueMetrics.packageRevenue.toFixed(2)}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Percentage
								</span>
								<span className="font-medium">
									{revenueMetrics.totalRevenue > 0
										? (
												(revenueMetrics.packageRevenue /
													revenueMetrics.totalRevenue) *
												100
											).toFixed(1)
										: 0}
									%
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
								<span className="text-muted-foreground text-sm">Revenue</span>
								<span className="font-medium">
									${revenueMetrics.customRevenue.toFixed(2)}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Percentage
								</span>
								<span className="font-medium">
									{revenueMetrics.totalRevenue > 0
										? (
												(revenueMetrics.customRevenue /
													revenueMetrics.totalRevenue) *
												100
											).toFixed(1)
										: 0}
									%
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
					<p className="text-muted-foreground text-sm">
						To enable comprehensive profit analysis, integrate cost tracking
						for:
					</p>
					<ul className="mt-2 space-y-1 text-muted-foreground text-sm">
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
