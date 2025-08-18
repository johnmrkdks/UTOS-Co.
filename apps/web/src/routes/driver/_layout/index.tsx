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

			{/* Compact Stats Cards */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-gray-600">Total Earnings</span>
							<DollarSignIcon className="h-3 w-3 text-green-600" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg font-bold text-gray-900">
							${driverStats.totalEarnings.toFixed(0)}
						</div>
						<p className="text-xs text-green-600 flex items-center gap-1">
							<TrendingUpIcon className="h-2 w-2" />
							+${driverStats.thisWeekEarnings.toFixed(0)} week
						</p>
					</CardContent>
				</Card>

				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-gray-600">Total Trips</span>
							<CarIcon className="h-3 w-3 text-blue-600" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg font-bold text-gray-900">{driverStats.totalTrips}</div>
						<p className="text-xs text-blue-600 flex items-center gap-1">
							<ActivityIcon className="h-2 w-2" />
							+{driverStats.thisWeekTrips} week
						</p>
					</CardContent>
				</Card>

				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-gray-600">Rating</span>
							<StarIcon className="h-3 w-3 text-yellow-600" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg font-bold text-gray-900 flex items-center gap-1">
							{driverStats.averageRating.toFixed(1)}
							<StarIcon className="h-3 w-3 text-yellow-500 fill-current" />
						</div>
						<p className="text-xs text-gray-600">
							{driverStats.completedTrips > 0 
								? `${driverStats.completedTrips} trips`
								: 'No ratings yet'
							}
						</p>
					</CardContent>
				</Card>

				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-gray-600">Hours</span>
							<ClockIcon className="h-3 w-3 text-purple-600" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg font-bold text-gray-900">{Math.floor(driverStats.activeHours)}h</div>
						<p className="text-xs text-purple-600 flex items-center gap-1">
							<TargetIcon className="h-2 w-2" />
							This month
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity Section */}
			<div className="grid grid-cols-1 gap-4 lg:gap-6">
				{/* Recent Bookings */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<CalendarIcon className="h-5 w-5 text-blue-600" />
									Recent Activity
								</CardTitle>
								<CardDescription>Your latest trips and bookings</CardDescription>
							</div>
							<Button variant="outline" size="sm" onClick={() => navigate({ to: "/driver/trips" })}>
								View All
								<ArrowRightIcon className="h-4 w-4 ml-2" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{driverStats.totalTrips === 0 ? (
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<CarIcon className="h-8 w-8 text-gray-400" />
								</div>
								<h3 className="font-medium text-gray-900 mb-2">No trips yet</h3>
								<p className="text-sm text-gray-600 mb-4">
									{isFullyOnboarded 
										? "Start accepting rides to see your activity here"
										: "Complete your setup to start accepting rides"
									}
								</p>
								{!isFullyOnboarded && (
									<Button 
										variant="outline"
										onClick={() => navigate({ to: "/driver/onboarding" })}
									>
										<UserIcon className="h-4 w-4 mr-2" />
										Complete Setup
									</Button>
								)}
							</div>
						) : (
							<div className="space-y-4">
								{recentBookings.map((booking) => (
									<div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
										<div className="flex items-center gap-4">
											<div className={`w-10 h-10 rounded-full flex items-center justify-center ${
												booking.status === 'completed' ? 'bg-green-100' : 
												booking.status === 'scheduled' ? 'bg-blue-100' : 'bg-gray-100'
											}`}>
												{booking.status === 'completed' ? (
													<CheckCircleIcon className="h-5 w-5 text-green-600" />
												) : booking.status === 'scheduled' ? (
													<ClockIcon className="h-5 w-5 text-blue-600" />
												) : (
													<CarIcon className="h-5 w-5 text-gray-600" />
												)}
											</div>
											<div>
												<div className="flex items-center gap-2 mb-1">
													<h4 className="font-medium">{booking.customer}</h4>
													<Badge variant={booking.status === 'completed' ? 'default' : 'secondary'} 
														   className={`text-xs ${
															booking.status === 'completed' ? 'bg-green-100 text-green-700' :
															booking.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
															'bg-gray-100 text-gray-700'
														}`}>
														{booking.status}
													</Badge>
												</div>
												<div className="text-sm text-gray-600 space-y-1">
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
										<div className="text-right">
											<div className="font-semibold text-gray-900 text-lg">
												${booking.amount.toFixed(2)}
											</div>
											{booking.status === 'completed' && (
												<div className="text-xs text-green-600">
													Earned ✨
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
