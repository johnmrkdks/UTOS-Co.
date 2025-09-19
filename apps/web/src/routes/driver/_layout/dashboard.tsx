import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { useUserQuery } from '@/hooks/query/use-user-query';
import { useCurrentDriverQuery } from '@/hooks/query/use-current-driver-query';
import { useDriverBookingsQuery } from '@/hooks/query/use-driver-bookings-query';
import { DriverStatusAccordion } from '@/features/driver/_components/driver-status-accordion';
import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import {
	CarIcon,
	DollarSignIcon,
	ClockIcon,
	StarIcon,
	TrendingUpIcon,
	CheckCircleIcon,
	UserIcon,
	ArrowRightIcon,
	CalendarIcon,
	MapPinIcon,
	ActivityIcon,
	TargetIcon
} from "lucide-react";

export const Route = createFileRoute('/driver/_layout/dashboard')({
	component: DriverDashboardComponent,
});

function DriverDashboardComponent() {
	const { session } = useUserQuery();
	const { data: currentDriver, isLoading: isDriverLoading } = useCurrentDriverQuery();
	const navigate = useNavigate();

	// Fetch bookings for current driver to get detailed trip analytics
	const { data: bookingsData, isLoading: isBookingsLoading } = useDriverBookingsQuery({
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
		...currentDriver
	};

	const bookings = bookingsData?.data || [];

	// Enhanced driver statistics based on real booking data
	const driverStats = {
		totalEarnings: bookings
			.filter(b => b.status === 'completed')
			.reduce((sum, b) => sum + (b.finalAmount || b.quotedAmount || 0), 0), // Amount in dollars
		thisWeekEarnings: driver.totalRides ? Math.floor(driver.totalRides * 0.15) * 45.5 : 0,
		totalTrips: bookings.filter(b => b.status === 'completed').length,
		thisWeekTrips: driver.totalRides ? Math.floor(driver.totalRides * 0.15) : 0,
		averageRating: driver.rating || 5.0,
		activeHours: driver.totalRides ? driver.totalRides * 1.8 : 0,
		completedTrips: bookings.filter(b => b.status === 'completed').length,
		upcomingTrips: bookings.filter(b => ['pending', 'confirmed', 'driver_assigned'].includes(b.status)).length,
		activeTrips: bookings.filter(b => ['in_progress'].includes(b.status)).length,
		cancelledTrips: bookings.filter(b => b.status === 'cancelled').length,
	};

	// Core analytics card data for drivers (streamlined)
	const analyticsData: AnalyticsCardData[] = [
		{
			id: 'active-trips',
			title: 'Active Trips',
			value: driverStats.activeTrips,
			icon: CarIcon,
			bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
			iconBg: 'bg-blue-600',
			changeText: 'currently in progress',
			changeType: driverStats.activeTrips > 0 ? 'positive' : 'neutral',
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'upcoming-trips',
			title: 'Upcoming Trips',
			value: driverStats.upcomingTrips,
			icon: CalendarIcon,
			bgGradient: 'bg-gradient-to-br from-amber-50 to-amber-100',
			iconBg: 'bg-amber-600',
			changeText: 'scheduled bookings',
			changeType: driverStats.upcomingTrips > 0 ? 'positive' : 'neutral',
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'completed-trips',
			title: 'Completed',
			value: driverStats.completedTrips,
			icon: CheckCircleIcon,
			bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
			iconBg: 'bg-green-600',
			changeText: 'trips finished',
			changeType: 'positive',
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true
		}
	];

	const recentBookings = [
		{
			id: 1,
			customer: "Sarah Johnson",
			pickup: "Sydney Airport",
			destination: "Circular Quay",
			time: "2:30 PM Today",
			status: "completed",
			amount: 85.50
		},
		{
			id: 2,
			customer: "Michael Chen",
			pickup: "Central Station",
			destination: "Bondi Beach",
			time: "10:15 AM Today",
			status: "completed",
			amount: 65.00
		},
		{
			id: 3,
			customer: "Emma Wilson",
			pickup: "Opera House",
			destination: "Parramatta",
			time: "Tomorrow 9:00 AM",
			status: "scheduled",
			amount: 95.00
		}
	];

	// Enhanced driver status tracking
	const driverStatus = {
		profileComplete: Boolean(driver.licenseNumber && driver.phoneNumber),
		documentsUploaded: Boolean(driver.licenseDocumentUrl),
		adminApproved: Boolean(driver.isApproved),
		isActive: Boolean(driver.isActive),
	};

	// Determine driver's current onboarding stage
	const getDriverStage = () => {
		if (!currentDriver) return { stage: 'not_registered', progress: 0 };
		if (!driverStatus.profileComplete) return { stage: 'profile_incomplete', progress: 25 };
		if (!driverStatus.adminApproved) return { stage: 'pending_approval', progress: 65 };
		if (!driverStatus.isActive) return { stage: 'approved_inactive', progress: 85 };
		return { stage: 'fully_active', progress: 100 };
	};

	const currentStage = getDriverStage();
	const isFullyOnboarded = currentStage.stage === 'fully_active';

	// Enhanced loading state
	if (isDriverLoading || isBookingsLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2"></div>
					<div className="h-32 bg-gray-200 rounded-lg"></div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
						))}
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="h-64 bg-gray-200 rounded-lg"></div>
						<div className="h-64 bg-gray-200 rounded-lg"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3 lg:space-y-4">
			{/* Welcome Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h1 className="text-xl lg:text-2xl font-bold text-gray-900">
						Welcome back, {session?.user?.name}! 👋
					</h1>
					<p className="text-gray-600 mt-1 text-sm">
						{isFullyOnboarded 
							? "You're all set! Start accepting rides and earning money." 
							: "Let's get your driver profile ready for action."
						}
					</p>
				</div>
				{isFullyOnboarded && (
					<div className="flex items-center gap-2">
						<Badge variant="default" className="bg-green-100 text-green-800 border-green-300 px-3 py-1 text-xs">
							<CheckCircleIcon className="h-3 w-3 mr-1" />
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
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 mb-6">
				{analyticsData.map((data, index) => (
					<div key={data.id} className={index === 2 ? "sm:col-span-2 lg:col-span-1" : ""}>
						<AnalyticsCard 
							data={data} 
							view="default" 
							className="hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] touch-manipulation rounded-lg min-h-[100px] [&_.analytics-card-title]:text-sm [&_.analytics-card-value]:text-lg [&_.analytics-card-change]:text-xs" 
						/>
					</div>
				))}
			</div>

			{/* Recent Activity Section - Mobile Optimized */}
			<div className="grid grid-cols-1 gap-4">
				{/* Recent Bookings */}
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
									<CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
								</div>
								<div>
									<CardTitle className="text-lg sm:text-xl font-bold text-foreground">
										Recent Activity
									</CardTitle>
									<CardDescription className="text-sm text-muted-foreground hidden sm:block">
										Your latest trips and bookings
									</CardDescription>
								</div>
							</div>
							<Button 
								variant="ghost" 
								size="sm" 
								className="text-xs sm:text-sm px-2 sm:px-3"
								onClick={() => navigate({ to: "/driver/trips" })}
							>
								View All
								<ArrowRightIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{driverStats.totalTrips === 0 ? (
							<div className="text-center py-8 sm:py-12">
								<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
									<CarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
								</div>
								<h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No trips yet</h3>
								<p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-sm mx-auto leading-relaxed">
									{isFullyOnboarded 
										? "Start accepting rides to see your activity here"
										: "Complete your setup to start accepting rides"
									}
								</p>
								{!isFullyOnboarded && (
									<Button 
										variant="outline"
										className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-medium"
										onClick={() => navigate({ to: "/driver/onboarding" })}
									>
										<UserIcon className="h-4 w-4 mr-2" />
										Complete Setup
									</Button>
								)}
							</div>
						) : (
							<div className="space-y-3 sm:space-y-4">
								{recentBookings.map((booking) => (
									<div key={booking.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/30 transition-all duration-200 hover:shadow-md active:scale-[0.98] touch-manipulation">
										<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
											<div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
												booking.status === 'completed' ? 'bg-green-100' : 
												booking.status === 'scheduled' ? 'bg-blue-100' : 'bg-muted'
											}`}>
												{booking.status === 'completed' ? (
													<CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
												) : booking.status === 'scheduled' ? (
													<ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
												) : (
													<CarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
												)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1 flex-wrap">
													<h4 className="font-medium text-foreground text-sm sm:text-base truncate">{booking.customer}</h4>
													<Badge 
														variant={booking.status === 'completed' ? 'default' : 'secondary'} 
														className={`text-xs px-2 py-0.5 ${
															booking.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
															booking.status === 'scheduled' ? 'bg-blue-100 text-blue-700 border-blue-200' :
															'bg-muted text-muted-foreground'
														}`}
													>
														{booking.status}
													</Badge>
												</div>
												<div className="text-xs sm:text-sm text-muted-foreground space-y-1">
													<div className="flex items-center gap-1">
														<MapPinIcon className="h-3 w-3 flex-shrink-0" />
														<span className="truncate">{booking.pickup} → {booking.destination}</span>
													</div>
													<div className="flex items-center gap-1">
														<CalendarIcon className="h-3 w-3 flex-shrink-0" />
														<span>{booking.time}</span>
													</div>
												</div>
											</div>
										</div>
										<div className="text-right flex-shrink-0">
											<div className="font-semibold text-foreground text-sm sm:text-lg">
												${booking.amount.toFixed(2)}
											</div>
											{booking.status === 'completed' && (
												<div className="text-xs text-green-600 flex items-center gap-1">
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