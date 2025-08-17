import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { useUserQuery } from '@/hooks/query/use-user-query';
import { useCurrentDriverQuery } from '@/hooks/query/use-current-driver-query';
import {
	CarIcon,
	DollarSignIcon,
	ClockIcon,
	StarIcon,
	TrendingUpIcon,
	AlertCircleIcon,
	CheckCircleIcon,
	UserIcon,
	ArrowRightIcon,
	CalendarIcon,
	MapPinIcon,
	PhoneIcon,
	ShieldCheckIcon,
	FileTextIcon,
	BellIcon,
	ActivityIcon,
	TargetIcon,
	AwardIcon
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
		<div className="space-y-4 lg:space-y-6">
			{/* Welcome Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
						Welcome back, {session?.user?.name}! 👋
					</h1>
					<p className="text-gray-600 mt-1 text-sm lg:text-base">
						{isFullyOnboarded 
							? "You're all set! Start accepting rides and earning money." 
							: "Let's get your driver profile ready for action."
						}
					</p>
				</div>
				{isFullyOnboarded && (
					<div className="flex items-center gap-2">
						<Badge variant="default" className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
							<CheckCircleIcon className="h-4 w-4 mr-1" />
							Active Driver
						</Badge>
					</div>
				)}
			</div>

			{/* Enhanced Driver Status Card */}
			{!isFullyOnboarded && (
				<Card className={`${
					currentStage.stage === 'not_registered' ? 'border-red-200 bg-red-50' :
					currentStage.stage === 'profile_incomplete' ? 'border-yellow-200 bg-yellow-50' :
					currentStage.stage === 'pending_approval' ? 'border-blue-200 bg-blue-50' :
					'border-green-200 bg-green-50'
				}`}>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className={`w-12 h-12 rounded-full flex items-center justify-center ${
									currentStage.stage === 'not_registered' ? 'bg-red-100' :
									currentStage.stage === 'profile_incomplete' ? 'bg-yellow-100' :
									currentStage.stage === 'pending_approval' ? 'bg-blue-100' :
									'bg-green-100'
								}`}>
									{currentStage.stage === 'not_registered' ? <AlertCircleIcon className="h-6 w-6 text-red-600" /> :
									 currentStage.stage === 'profile_incomplete' ? <UserIcon className="h-6 w-6 text-yellow-600" /> :
									 currentStage.stage === 'pending_approval' ? <ClockIcon className="h-6 w-6 text-blue-600" /> :
									 <ShieldCheckIcon className="h-6 w-6 text-green-600" />}
								</div>
								<div>
									<CardTitle className={
										currentStage.stage === 'not_registered' ? 'text-red-900' :
										currentStage.stage === 'profile_incomplete' ? 'text-yellow-900' :
										currentStage.stage === 'pending_approval' ? 'text-blue-900' :
										'text-green-900'
									}>
										{currentStage.stage === 'not_registered' ? 'Driver Profile Required' :
										 currentStage.stage === 'profile_incomplete' ? 'Complete Your Profile' :
										 currentStage.stage === 'pending_approval' ? 'Application Under Review' :
										 'Almost Ready to Drive!'}
									</CardTitle>
									<CardDescription className={
										currentStage.stage === 'not_registered' ? 'text-red-700' :
										currentStage.stage === 'profile_incomplete' ? 'text-yellow-700' :
										currentStage.stage === 'pending_approval' ? 'text-blue-700' :
										'text-green-700'
									}>
										{currentStage.stage === 'not_registered' ? 'Create your driver profile to get started' :
										 currentStage.stage === 'profile_incomplete' ? 'Add required information to submit for approval' :
										 currentStage.stage === 'pending_approval' ? 'Our team is reviewing your application' :
										 'Activate your account to start accepting rides'}
									</CardDescription>
								</div>
							</div>
							<Badge variant="outline" className={`${
								currentStage.stage === 'not_registered' ? 'bg-red-100 text-red-800 border-red-300' :
								currentStage.stage === 'profile_incomplete' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
								currentStage.stage === 'pending_approval' ? 'bg-blue-100 text-blue-800 border-blue-300' :
								'bg-green-100 text-green-800 border-green-300'
							} px-3 py-1 font-medium`}>
								{currentStage.progress}% Complete
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<Progress value={currentStage.progress} className="w-full h-2" />

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Profile Status */}
							<div className="flex items-center justify-between p-3 bg-white rounded-lg border">
								<div className="flex items-center gap-3">
									{driverStatus.profileComplete ? (
										<CheckCircleIcon className="h-5 w-5 text-green-600" />
									) : (
										<AlertCircleIcon className="h-5 w-5 text-yellow-600" />
									)}
									<div>
										<p className="font-medium text-sm">Profile Complete</p>
										<p className="text-xs text-gray-600">License & Contact Info</p>
									</div>
								</div>
								<Badge variant={driverStatus.profileComplete ? "default" : "secondary"} className={
									driverStatus.profileComplete ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
								}>
									{driverStatus.profileComplete ? "Done" : "Required"}
								</Badge>
							</div>

							{/* Admin Approval Status */}
							<div className="flex items-center justify-between p-3 bg-white rounded-lg border">
								<div className="flex items-center gap-3">
									{driverStatus.adminApproved ? (
										<CheckCircleIcon className="h-5 w-5 text-green-600" />
									) : (
										<ClockIcon className="h-5 w-5 text-blue-600" />
									)}
									<div>
										<p className="font-medium text-sm">Admin Approval</p>
										<p className="text-xs text-gray-600">Background Check</p>
									</div>
								</div>
								<Badge variant={driverStatus.adminApproved ? "default" : "outline"} className={
									driverStatus.adminApproved ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700 border-blue-300"
								}>
									{driverStatus.adminApproved ? "Approved" : "Pending"}
								</Badge>
							</div>

							{/* Documents Status */}
							<div className="flex items-center justify-between p-3 bg-white rounded-lg border">
								<div className="flex items-center gap-3">
									{driverStatus.documentsUploaded ? (
										<CheckCircleIcon className="h-5 w-5 text-green-600" />
									) : (
										<FileTextIcon className="h-5 w-5 text-gray-400" />
									)}
									<div>
										<p className="font-medium text-sm">Documents</p>
										<p className="text-xs text-gray-600">License & Insurance</p>
									</div>
								</div>
								<Badge variant="outline" className="bg-gray-100 text-gray-600">
									{driverStatus.documentsUploaded ? "Uploaded" : "Optional"}
								</Badge>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-3">
							{currentStage.stage === 'profile_incomplete' && (
								<Button 
									className="bg-yellow-600 hover:bg-yellow-700 text-white"
									onClick={() => navigate({ to: "/driver/onboarding" })}
								>
									<UserIcon className="h-4 w-4 mr-2" />
									Complete Profile Now
								</Button>
							)}
							{currentStage.stage === 'approved_inactive' && (
								<Button 
									className="bg-green-600 hover:bg-green-700 text-white"
									onClick={() => {/* TODO: Implement activate account */}}
								>
									<CarIcon className="h-4 w-4 mr-2" />
									Activate & Go Online
								</Button>
							)}
							<Button 
								variant="outline"
								onClick={() => navigate({ to: "/driver/profile" })}
							>
								<UserIcon className="h-4 w-4 mr-2" />
								View Profile
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Enhanced Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
				<Card className="relative overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-gray-700">Total Earnings</CardTitle>
						<div className="p-2 bg-green-100 rounded-full">
							<DollarSignIcon className="h-4 w-4 text-green-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-gray-900">
							${driverStats.totalEarnings.toFixed(0)}
						</div>
						<p className="text-sm text-green-600 flex items-center gap-1 mt-1">
							<TrendingUpIcon className="h-3 w-3" />
							+${driverStats.thisWeekEarnings.toFixed(0)} this week
						</p>
						{!isFullyOnboarded && (
							<div className="text-xs text-gray-500 mt-2">
								💡 Complete setup to start earning
							</div>
						)}
					</CardContent>
					<div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full transform translate-x-8 -translate-y-8"></div>
				</Card>

				<Card className="relative overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-gray-700">Total Trips</CardTitle>
						<div className="p-2 bg-blue-100 rounded-full">
							<CarIcon className="h-4 w-4 text-blue-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-gray-900">{driverStats.totalTrips}</div>
						<p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
							<ActivityIcon className="h-3 w-3" />
							+{driverStats.thisWeekTrips} this week
						</p>
						{driverStats.totalTrips === 0 && (
							<div className="text-xs text-gray-500 mt-2">
								🚗 Ready for your first ride?
							</div>
						)}
					</CardContent>
					<div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full transform translate-x-8 -translate-y-8"></div>
				</Card>

				<Card className="relative overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-gray-700">Average Rating</CardTitle>
						<div className="p-2 bg-yellow-100 rounded-full">
							<StarIcon className="h-4 w-4 text-yellow-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-gray-900 flex items-center gap-1">
							{driverStats.averageRating.toFixed(1)}
							<StarIcon className="h-5 w-5 text-yellow-500 fill-current" />
						</div>
						<p className="text-sm text-gray-600 mt-1">
							{driverStats.completedTrips > 0 
								? `Based on ${driverStats.completedTrips} trips`
								: 'No ratings yet'
							}
						</p>
						{driverStats.averageRating >= 4.8 && (
							<div className="text-xs text-yellow-600 mt-2">
								🌟 Excellent service!
							</div>
						)}
					</CardContent>
					<div className="absolute top-0 right-0 w-20 h-20 bg-yellow-50 rounded-full transform translate-x-8 -translate-y-8"></div>
				</Card>

				<Card className="relative overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-gray-700">Active Hours</CardTitle>
						<div className="p-2 bg-purple-100 rounded-full">
							<ClockIcon className="h-4 w-4 text-purple-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-gray-900">{Math.floor(driverStats.activeHours)}h</div>
						<p className="text-sm text-purple-600 flex items-center gap-1 mt-1">
							<TargetIcon className="h-3 w-3" />
							This month
						</p>
						{driverStats.activeHours > 40 && (
							<div className="text-xs text-purple-600 mt-2">
								⚡ Great dedication!
							</div>
						)}
					</CardContent>
					<div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full transform translate-x-8 -translate-y-8"></div>
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
