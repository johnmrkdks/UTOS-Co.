import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { format } from "date-fns";
import {
	ActivityIcon,
	ArrowRightIcon,
	CalendarIcon,
	CarIcon,
	CheckCircleIcon,
	ClockIcon,
	DollarSignIcon,
	MapPinIcon,
	StarIcon,
	TargetIcon,
	TrendingUpIcon,
	UserIcon,
} from "lucide-react";
import { useMemo } from "react";
import {
	AnalyticsCard,
	type AnalyticsCardData,
} from "@/components/analytics-card";
import { DriverStatusAccordion } from "@/features/driver/_components/driver-status-accordion";
import { useCurrentDriverQuery } from "@/hooks/query/use-current-driver-query";
import { useDriverBookingsQuery } from "@/hooks/query/use-driver-bookings-query";
import { useUserQuery } from "@/hooks/query/use-user-query";

export const Route = createFileRoute("/driver/_layout/dashboard")({
	component: DriverDashboardComponent,
});

function DriverDashboardComponent() {
	const { session } = useUserQuery();
	const { data: currentDriver, isLoading: isDriverLoading } =
		useCurrentDriverQuery();
	const navigate = useNavigate();

	// Fetch bookings for current driver to get detailed trip analytics
	const { data: bookingsData, isLoading: isBookingsLoading } =
		useDriverBookingsQuery({
			driverId: currentDriver?.id || "",
			limit: 50,
			offset: 0,
		});

	// Driver data with fallback values
	const driver = {
		totalRides: 0,
		rating: 5.0,
		licenseNumber: null,
		phoneNumber: null,
		licenseDocumentUrl: null,
		isApproved: false,
		isActive: false,
		...currentDriver,
	};

	const bookings = bookingsData?.data || [];

	// Enhanced driver statistics based on real booking data
	const driverStats = {
		totalEarnings: bookings
			.filter((b) => b.status === "completed")
			.reduce((sum, b) => sum + (b.finalAmount || b.quotedAmount || 0), 0), // Amount in dollars
		thisWeekEarnings: driver.totalRides
			? Math.floor(driver.totalRides * 0.15) * 45.5
			: 0,
		totalTrips: bookings.filter((b) => b.status === "completed").length,
		thisWeekTrips: driver.totalRides ? Math.floor(driver.totalRides * 0.15) : 0,
		averageRating: driver.rating || 5.0,
		activeHours: driver.totalRides ? driver.totalRides * 1.8 : 0,
		completedTrips: bookings.filter((b) => b.status === "completed").length,
		upcomingTrips: bookings.filter((b) =>
			["pending", "confirmed", "driver_assigned"].includes(b.status),
		).length,
		activeTrips: bookings.filter((b) =>
			[
				"driver_en_route",
				"in_progress",
				"arrived_pickup",
				"passenger_on_board",
			].includes(b.status),
		).length,
		cancelledTrips: bookings.filter((b) => b.status === "cancelled").length,
	};

	// Core analytics card data for drivers (streamlined)
	const analyticsData: AnalyticsCardData[] = [
		{
			id: "active-trips",
			title: "Active Trips",
			value: driverStats.activeTrips,
			icon: CarIcon,
			bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
			iconBg: "bg-blue-600",
			changeText: "currently in progress",
			changeType: driverStats.activeTrips > 0 ? "positive" : "neutral",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "upcoming-trips",
			title: "Upcoming Trips",
			value: driverStats.upcomingTrips,
			icon: CalendarIcon,
			bgGradient: "bg-gradient-to-br from-amber-50 to-amber-100",
			iconBg: "bg-amber-600",
			changeText: "scheduled bookings",
			changeType: driverStats.upcomingTrips > 0 ? "positive" : "neutral",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "completed-trips",
			title: "Completed",
			value: driverStats.completedTrips,
			icon: CheckCircleIcon,
			bgGradient: "bg-gradient-to-br from-green-50 to-green-100",
			iconBg: "bg-green-600",
			changeText: "trips finished",
			changeType: "positive",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	// Use real bookings for recent activity (amounts are already driver share from API)
	const recentBookings = useMemo(() => {
		const sorted = [...bookings].sort(
			(a, b) =>
				new Date(b.scheduledPickupTime).getTime() -
				new Date(a.scheduledPickupTime).getTime(),
		);
		return sorted.slice(0, 5).map((b) => ({
			id: b.id,
			customer: b.customerName || "Customer",
			pickup: b.originAddress?.split(",")[0] || b.originAddress || "Pickup",
			destination:
				b.destinationAddress?.split(",")[0] ||
				b.destinationAddress ||
				"Destination",
			time: format(new Date(b.scheduledPickupTime), "MMM d, h:mm a"),
			status:
				b.status === "completed" || b.status === "no_show"
					? "completed"
					: "scheduled",
			amount: b.driverShare ?? (b.finalAmount || b.quotedAmount || 0),
		}));
	}, [bookings]);

	// Enhanced driver status tracking
	const driverStatus = {
		profileComplete: Boolean(driver.licenseNumber && driver.phoneNumber),
		documentsUploaded: Boolean(driver.licenseDocumentUrl),
		adminApproved: Boolean(driver.isApproved),
		isActive: Boolean(driver.isActive),
	};

	// Determine driver's current onboarding stage
	const getDriverStage = () => {
		if (!currentDriver) return { stage: "not_registered", progress: 0 };
		if (!driverStatus.profileComplete)
			return { stage: "profile_incomplete", progress: 25 };
		if (!driverStatus.adminApproved)
			return { stage: "pending_approval", progress: 65 };
		if (!driverStatus.isActive)
			return { stage: "approved_inactive", progress: 85 };
		return { stage: "fully_active", progress: 100 };
	};

	const currentStage = getDriverStage();
	const isFullyOnboarded = currentStage.stage === "fully_active";

	// Enhanced loading state
	if (isDriverLoading || isBookingsLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse space-y-4">
					<div className="mb-2 h-8 w-1/3 rounded bg-gray-200" />
					<div className="h-4 w-1/2 rounded bg-gray-200" />
					<div className="h-32 rounded-lg bg-gray-200" />
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-32 rounded-lg bg-gray-200" />
						))}
					</div>
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<div className="h-64 rounded-lg bg-gray-200" />
						<div className="h-64 rounded-lg bg-gray-200" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3 lg:space-y-4">
			{/* Welcome Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-gray-900 text-xl lg:text-2xl">
						Welcome back, {session?.user?.name}! 👋
					</h1>
					<p className="mt-1 text-gray-600 text-sm">
						{isFullyOnboarded
							? "You're all set! Start accepting rides and earning money."
							: "Let's get your driver profile ready for action."}
					</p>
				</div>
				{isFullyOnboarded && (
					<div className="flex items-center gap-2">
						<Badge
							variant="default"
							className="border-green-300 bg-green-100 px-3 py-1 text-green-800 text-xs"
						>
							<CheckCircleIcon className="mr-1 h-3 w-3" />
							Active Driver
						</Badge>
					</div>
				)}
			</div>

			{/* Driver Status Accordion */}
			<DriverStatusAccordion
				currentStage={currentStage}
				driverStatus={driverStatus}
				isFullyOnboarded={isFullyOnboarded}
			/>

			{/* Streamlined Analytics Grid - 3 Essential Cards */}
			<div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
				{analyticsData.map((data, index) => (
					<div
						key={data.id}
						className={index === 2 ? "sm:col-span-2 lg:col-span-1" : ""}
					>
						<AnalyticsCard
							data={data}
							view="default"
							className="min-h-[100px] touch-manipulation rounded-lg transition-all duration-200 hover:scale-[1.01] hover:shadow-md active:scale-[0.99] [&_.analytics-card-change]:text-xs [&_.analytics-card-title]:text-sm [&_.analytics-card-value]:text-lg"
						/>
					</div>
				))}
			</div>

			{/* Recent Activity Section - Mobile Optimized */}
			<div className="grid grid-cols-1 gap-4">
				{/* Recent Bookings */}
				<Card className="transition-shadow hover:shadow-md">
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-10 sm:w-10">
									<CalendarIcon className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
								</div>
								<div>
									<CardTitle className="font-bold text-foreground text-lg sm:text-xl">
										Recent Activity
									</CardTitle>
									<CardDescription className="hidden text-muted-foreground text-sm sm:block">
										Your latest trips and bookings
									</CardDescription>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="px-2 text-xs sm:px-3 sm:text-sm"
								onClick={() => navigate({ to: "/driver/trips" })}
							>
								View All
								<ArrowRightIcon className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{driverStats.totalTrips === 0 ? (
							<div className="py-8 text-center sm:py-12">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50 sm:mb-6 sm:h-20 sm:w-20">
									<CarIcon className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
								</div>
								<h3 className="mb-2 font-semibold text-foreground text-lg sm:text-xl">
									No trips yet
								</h3>
								<p className="mx-auto mb-4 max-w-sm text-muted-foreground text-sm leading-relaxed sm:mb-6 sm:text-base">
									{isFullyOnboarded
										? "Start accepting rides to see your activity here"
										: "Complete your setup to start accepting rides"}
								</p>
								{!isFullyOnboarded && (
									<Button
										variant="outline"
										className="h-11 px-6 font-medium text-sm sm:h-12 sm:px-8 sm:text-base"
										onClick={() => navigate({ to: "/driver/onboarding" })}
									>
										<UserIcon className="mr-2 h-4 w-4" />
										Complete Setup
									</Button>
								)}
							</div>
						) : (
							<div className="space-y-3 sm:space-y-4">
								{recentBookings.map((booking) => (
									<div
										key={booking.id}
										className="flex touch-manipulation items-center justify-between rounded-lg border p-3 transition-all duration-200 hover:bg-muted/30 hover:shadow-md active:scale-[0.98] sm:p-4"
									>
										<div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
											<div
												className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
													booking.status === "completed"
														? "bg-green-100"
														: booking.status === "scheduled"
															? "bg-blue-100"
															: "bg-muted"
												}`}
											>
												{booking.status === "completed" ? (
													<CheckCircleIcon className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
												) : booking.status === "scheduled" ? (
													<ClockIcon className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
												) : (
													<CarIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
												)}
											</div>
											<div className="min-w-0 flex-1">
												<div className="mb-1 flex flex-wrap items-center gap-2">
													<h4 className="truncate font-medium text-foreground text-sm sm:text-base">
														{booking.customer}
													</h4>
													<Badge
														variant={
															booking.status === "completed"
																? "default"
																: "secondary"
														}
														className={`px-2 py-0.5 text-xs ${
															booking.status === "completed"
																? "border-green-200 bg-green-100 text-green-700"
																: booking.status === "scheduled"
																	? "border-blue-200 bg-blue-100 text-blue-700"
																	: "bg-muted text-muted-foreground"
														}`}
													>
														{booking.status}
													</Badge>
												</div>
												<div className="space-y-1 text-muted-foreground text-xs sm:text-sm">
													<div className="flex items-center gap-1">
														<MapPinIcon className="h-3 w-3 flex-shrink-0" />
														<span className="truncate">
															{booking.pickup} → {booking.destination}
														</span>
													</div>
													<div className="flex items-center gap-1">
														<CalendarIcon className="h-3 w-3 flex-shrink-0" />
														<span>{booking.time}</span>
													</div>
												</div>
											</div>
										</div>
										<div className="flex-shrink-0 text-right">
											<div className="font-semibold text-foreground text-sm sm:text-lg">
												${booking.amount.toFixed(2)}
											</div>
											{booking.status === "completed" && (
												<div className="flex items-center gap-1 text-green-600 text-xs">
													<TrendingUpIcon className="h-2 w-2" />
													Earned
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
