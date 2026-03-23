import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	AlertTriangle,
	ArrowRightIcon,
	Calculator,
	Calendar,
	Car,
	CheckCircle,
	Clock,
	MapPin,
	Package,
	Plus,
	Users,
} from "lucide-react";
import { useMemo } from "react";
import {
	AnalyticsCard,
	type AnalyticsCardData,
} from "@/components/analytics-card";
import { useUnifiedUserBookingsQuery } from "@/hooks/query/use-unified-user-bookings-query";
import { useUserQuery } from "@/hooks/query/use-user-query";

export function CustomerBookingsDashboardPage() {
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	const {
		data: bookingsData,
		isLoading,
		error,
	} = useUnifiedUserBookingsQuery({
		limit: 50,
		offset: 0,
	});

	const bookings = bookingsData?.data || [];

	// Calculate stats
	const stats = useMemo(() => {
		const upcoming = bookings.filter(
			(b) =>
				new Date(b.scheduledPickupTime) > new Date() &&
				![
					"completed",
					"cancelled",
					"driver_en_route",
					"in_progress",
					"arrived_pickup",
					"passenger_on_board",
				].includes(b.status),
		).length;

		const inProgress = bookings.filter((b) =>
			[
				"driver_en_route",
				"in_progress",
				"arrived_pickup",
				"passenger_on_board",
			].includes(b.status),
		).length;
		const completed = bookings.filter((b) => b.status === "completed").length;
		const total = bookings.length;

		return { upcoming, inProgress, completed, total };
	}, [bookings]);

	// Get recent bookings for quick overview
	const recentBookings = bookings
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
		.slice(0, 3);

	// Analytics card data for customer dashboard
	const dashboardStatsData: AnalyticsCardData[] = [
		{
			id: "upcoming",
			title: "Upcoming Trips",
			value: stats.upcoming,
			icon: Calendar,
			bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
			iconBg: "bg-blue-500",
			showIcon: true,
			showBackgroundIcon: true,
			changeText: "Scheduled bookings",
			changeType: "neutral",
		},
		{
			id: "in-progress",
			title: "Active Trips",
			value: stats.inProgress,
			icon: Clock,
			bgGradient: "bg-gradient-to-br from-orange-50 to-orange-100",
			iconBg: "bg-orange-500",
			showIcon: true,
			showBackgroundIcon: true,
			changeText: "Currently in progress",
			changeType: "positive",
		},
		{
			id: "completed",
			title: "Completed",
			value: stats.completed,
			icon: CheckCircle,
			bgGradient: "bg-gradient-to-br from-green-50 to-green-100",
			iconBg: "bg-green-500",
			showIcon: true,
			showBackgroundIcon: true,
			changeText: "Total trips completed",
			changeType: "positive",
		},
	];

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Clock className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header */}
			<div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
				<div>
					<h1 className="font-bold text-xl tracking-tight sm:text-2xl">
						My Bookings Dashboard
					</h1>
					<p className="text-muted-foreground text-sm sm:text-base">
						Welcome back! Here's an overview of your booking activity.
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button
						asChild
						variant="outline"
						size="sm"
						className="hidden sm:flex"
					>
						<Link to="/services">
							<Package className="mr-2 h-4 w-4" />
							Browse Services
						</Link>
					</Button>
					<Button asChild size="sm">
						<Link to="/">
							<Calculator className="mr-2 h-4 w-4" />
							Get Quote
						</Link>
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{dashboardStatsData.map((data) => (
					<AnalyticsCard key={data.id} data={data} view="compact" />
				))}
			</div>

			{/* Quick Actions & Recent Bookings */}
			<div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
				{/* Quick Actions */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-lg">Quick Actions</CardTitle>
						<CardDescription className="text-sm">
							Common tasks to manage your bookings
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Button
							asChild
							variant="outline"
							size="sm"
							className="h-10 w-full justify-start"
						>
							<Link to="/my-bookings/trips">
								<Calendar className="mr-2 h-4 w-4" />
								View My Trips
								<ArrowRightIcon className="ml-auto h-4 w-4" />
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="sm"
							className="h-10 w-full justify-start"
						>
							<Link to="/my-bookings/history">
								<CheckCircle className="mr-2 h-4 w-4" />
								View History
								<ArrowRightIcon className="ml-auto h-4 w-4" />
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="sm"
							className="h-10 w-full justify-start"
						>
							<Link to="/services">
								<Package className="mr-2 h-4 w-4" />
								Book New Service
								<ArrowRightIcon className="ml-auto h-4 w-4" />
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="sm"
							className="h-10 w-full justify-start"
						>
							<Link to="/">
								<Calculator className="mr-2 h-4 w-4" />
								Calculate Quote
								<ArrowRightIcon className="ml-auto h-4 w-4" />
							</Link>
						</Button>
					</CardContent>
				</Card>

				{/* Recent Bookings */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-lg">Recent Bookings</CardTitle>
						<CardDescription className="text-sm">
							Your latest booking activity
						</CardDescription>
					</CardHeader>
					<CardContent>
						{recentBookings.length > 0 ? (
							<div className="space-y-2">
								{recentBookings.map((booking, index) => (
									<div
										key={booking.id}
										className="flex items-center justify-between rounded-lg border bg-muted/20 p-2.5"
									>
										<div className="flex min-w-0 flex-1 items-center space-x-2">
											{booking.bookingType === "package" ? (
												<Package className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
											) : (
												<Car className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
											)}
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium text-sm">
													{booking.customerName || "Booking"}
												</p>
												<p className="text-muted-foreground text-xs">
													{new Date(
														booking.scheduledPickupTime,
													).toLocaleDateString()}
												</p>
											</div>
										</div>
										<div className="flex-shrink-0 text-right">
											<span
												className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
													booking.status === "confirmed"
														? "bg-green-100 text-green-800"
														: booking.status === "pending"
															? "bg-yellow-100 text-yellow-800"
															: booking.status === "in_progress"
																? "bg-blue-100 text-blue-800"
																: "bg-gray-100 text-gray-800"
												}`}
											>
												{booking.status}
											</span>
										</div>
									</div>
								))}
								<Button
									asChild
									variant="outline"
									size="sm"
									className="h-9 w-full"
								>
									<Link to="/my-bookings/trips">View All Trips</Link>
								</Button>
							</div>
						) : (
							<div className="py-4 text-center">
								<Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
								<p className="mt-2 text-muted-foreground text-sm">
									No bookings yet
								</p>
								<Button asChild size="sm" className="mt-2">
									<Link to="/services">
										<Plus className="mr-2 h-4 w-4" />
										Create First Booking
									</Link>
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
