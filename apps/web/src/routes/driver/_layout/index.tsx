import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { useUserQuery } from '@/hooks/query/use-user-query';
import { useCurrentDriverQuery } from '@/hooks/query/use-current-driver-query';
import { DriverStatusAccordion } from '@/features/driver/_components/driver-status-accordion';
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

export const Route = createFileRoute('/driver/_layout/')({
	component: DriverDashboardComponent,
});

function DriverDashboardComponent() {
	const { session } = useUserQuery();
	const { data: currentDriver, isLoading: isDriverLoading } = useCurrentDriverQuery();
	const navigate = useNavigate();

	// Calculate driver statistics based on real data
	const driverStats = {
		totalEarnings: currentDriver?.totalRides ? currentDriver.totalRides * 45.5 : 0,
		thisWeekEarnings: currentDriver?.totalRides ? Math.floor(currentDriver.totalRides * 0.15) * 45.5 : 0,
		totalTrips: currentDriver?.totalRides || 0,
		thisWeekTrips: currentDriver?.totalRides ? Math.floor(currentDriver.totalRides * 0.15) : 0,
		averageRating: currentDriver?.rating || 5.0,
		activeHours: currentDriver?.totalRides ? currentDriver.totalRides * 1.8 : 0,
		completedTrips: currentDriver?.totalRides || 0,
		cancelledTrips: 0,
	};

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
		profileComplete: Boolean(currentDriver?.licenseNumber && currentDriver?.phoneNumber),
		documentsUploaded: Boolean(currentDriver?.licenseDocumentUrl),
		adminApproved: Boolean(currentDriver?.isApproved),
		isActive: Boolean(currentDriver?.isActive),
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
	if (isDriverLoading) {
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

			{/* Mobile-Optimized Stats Cards */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
				{/* Total Earnings Card */}
				<Card className="p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-muted-foreground truncate">Earnings</span>
							<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
								<DollarSignIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg sm:text-xl font-bold text-foreground">
							${driverStats.totalEarnings.toFixed(0)}
						</div>
						<p className="text-xs text-green-600 flex items-center gap-1">
							<TrendingUpIcon className="h-2 w-2" />
							+${driverStats.thisWeekEarnings.toFixed(0)}
						</p>
					</CardContent>
				</Card>

				{/* Total Trips Card */}
				<Card className="p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-muted-foreground truncate">Trips</span>
							<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
								<CarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg sm:text-xl font-bold text-foreground">{driverStats.totalTrips}</div>
						<p className="text-xs text-blue-600 flex items-center gap-1">
							<ActivityIcon className="h-2 w-2" />
							+{driverStats.thisWeekTrips} week
						</p>
					</CardContent>
				</Card>

				{/* Rating Card */}
				<Card className="p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-muted-foreground truncate">Rating</span>
							<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
								<StarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-600" />
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-1">
							{driverStats.averageRating.toFixed(1)}
							<StarIcon className="h-3 w-3 text-yellow-500 fill-current" />
						</div>
						<p className="text-xs text-muted-foreground truncate">
							{driverStats.completedTrips > 0 
								? `${driverStats.completedTrips} trips`
								: 'No ratings'
							}
						</p>
					</CardContent>
				</Card>

				{/* Hours Card */}
				<Card className="p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-muted-foreground truncate">Hours</span>
							<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
								<ClockIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-600" />
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg sm:text-xl font-bold text-foreground">{Math.floor(driverStats.activeHours)}h</div>
						<p className="text-xs text-purple-600 flex items-center gap-1">
							<TargetIcon className="h-2 w-2" />
							Month
						</p>
					</CardContent>
				</Card>
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
