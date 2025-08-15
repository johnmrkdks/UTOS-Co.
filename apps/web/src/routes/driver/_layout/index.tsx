import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { useUserQuery } from '@/hooks/query/use-user-query';
import {
	CarIcon,
	DollarSignIcon,
	ClockIcon,
	StarIcon,
	TrendingUpIcon,
	AlertCircleIcon,
	CheckCircleIcon,
	MailIcon,
	UserIcon,
	ArrowRightIcon,
	CalendarIcon,
	MapPinIcon,
	PhoneIcon
} from "lucide-react";

export const Route = createFileRoute('/driver/_layout/')({
	component: DriverDashboardComponent,
});

function DriverDashboardComponent() {
	const { session } = useUserQuery();

	// Mock data - in real app, this would come from API
	const driverStats = {
		totalEarnings: 2850.50,
		thisWeekEarnings: 420.75,
		totalTrips: 87,
		thisWeekTrips: 12,
		averageRating: 4.8,
		activeHours: 156,
		completedTrips: 87,
		cancelledTrips: 3,
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

	const onboardingProgress = {
		emailVerified: session?.user?.emailVerified || false,
		profileComplete: false, // This would be determined by checking driver profile
		documentsUploaded: false,
		adminApproved: false,
	};

	const completedSteps = Object.values(onboardingProgress).filter(Boolean).length;
	const totalSteps = Object.keys(onboardingProgress).length;
	const progressPercentage = (completedSteps / totalSteps) * 100;

	const isFullyOnboarded = completedSteps === totalSteps;

	return (
		<div className="space-y-4 lg:space-y-6">
			{/* Welcome Header */}
			<div>
				<h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome back, {session?.user?.name}!</h1>
				<p className="text-gray-600 mt-1 text-sm lg:text-base">Here's your driver dashboard overview</p>
			</div>

			{/* Onboarding Status Card */}
			{!isFullyOnboarded && (
				<Card className="border-blue-200 bg-blue-50">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-blue-900">Complete Your Driver Setup</CardTitle>
								<CardDescription className="text-blue-700">
									{completedSteps} of {totalSteps} steps completed
								</CardDescription>
							</div>
							<Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
								{Math.round(progressPercentage)}% Complete
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<Progress value={progressPercentage} className="w-full" />

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{onboardingProgress.emailVerified ? (
											<CheckCircleIcon className="h-4 w-4 text-green-600" />
										) : (
											<AlertCircleIcon className="h-4 w-4 text-yellow-600" />
										)}
										<span className="text-sm">Email Verification</span>
									</div>
									{onboardingProgress.emailVerified ? (
										<Badge variant="default" className="bg-green-100 text-green-700 text-xs">Done</Badge>
									) : (
										<Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>
									)}
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{onboardingProgress.profileComplete ? (
											<CheckCircleIcon className="h-4 w-4 text-green-600" />
										) : (
											<AlertCircleIcon className="h-4 w-4 text-yellow-600" />
										)}
										<span className="text-sm">Complete Profile</span>
									</div>
									{onboardingProgress.profileComplete ? (
										<Badge variant="default" className="bg-green-100 text-green-700 text-xs">Done</Badge>
									) : (
										<Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>
									)}
								</div>
							</div>

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{onboardingProgress.documentsUploaded ? (
											<CheckCircleIcon className="h-4 w-4 text-green-600" />
										) : (
											<AlertCircleIcon className="h-4 w-4 text-gray-400" />
										)}
										<span className="text-sm">Documents (Optional)</span>
									</div>
									<Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">Later</Badge>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{onboardingProgress.adminApproved ? (
											<CheckCircleIcon className="h-4 w-4 text-green-600" />
										) : (
											<ClockIcon className="h-4 w-4 text-blue-600" />
										)}
										<span className="text-sm">Admin Approval</span>
									</div>
									<Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">Review</Badge>
								</div>
							</div>
						</div>

						<div className="pt-2 flex flex-col sm:flex-row gap-2 sm:gap-3">
							{!onboardingProgress.emailVerified && (
								<Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
									<MailIcon className="h-4 w-4 mr-2" />
									Verify Email
								</Button>
							)}
							{!onboardingProgress.profileComplete && onboardingProgress.emailVerified && (
								<Button size="sm" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
									<UserIcon className="h-4 w-4 mr-2" />
									Complete Profile
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
						<DollarSignIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${driverStats.totalEarnings.toFixed(2)}</div>
						<p className="text-xs text-muted-foreground">
							+${driverStats.thisWeekEarnings.toFixed(2)} this week
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Trips</CardTitle>
						<CarIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{driverStats.totalTrips}</div>
						<p className="text-xs text-muted-foreground">
							+{driverStats.thisWeekTrips} this week
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Rating</CardTitle>
						<StarIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{driverStats.averageRating}</div>
						<p className="text-xs text-muted-foreground">
							Based on {driverStats.completedTrips} completed trips
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Hours</CardTitle>
						<ClockIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{driverStats.activeHours}h</div>
						<p className="text-xs text-muted-foreground">
							This month
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
				{/* Recent Bookings */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Recent Bookings</CardTitle>
							<Button variant="outline" size="sm">
								View All
								<ArrowRightIcon className="h-4 w-4 ml-2" />
							</Button>
						</div>
						<CardDescription>Your latest booking activity</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentBookings.map((booking) => (
								<div key={booking.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3 sm:gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<h4 className="font-medium text-sm lg:text-base">{booking.customer}</h4>
											<Badge variant={booking.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
												{booking.status}
											</Badge>
										</div>
										<div className="text-xs lg:text-sm text-gray-600 space-y-1">
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
									<div className="text-right sm:text-left">
										<div className="font-semibold text-green-600 text-lg">
											${booking.amount.toFixed(2)}
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Frequently used features</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<Button className="w-full justify-start text-left" size="lg">
								<CarIcon className="h-5 w-5 mr-3 flex-shrink-0" />
								<span className="truncate">Go Online / Start Accepting Rides</span>
							</Button>

							<Button variant="outline" className="w-full justify-start text-left" size="lg">
								<UserIcon className="h-5 w-5 mr-3 flex-shrink-0" />
								<span className="truncate">Update My Profile</span>
							</Button>

							<Button variant="outline" className="w-full justify-start text-left" size="lg">
								<TrendingUpIcon className="h-5 w-5 mr-3 flex-shrink-0" />
								<span className="truncate">View Earnings Report</span>
							</Button>

							<Button variant="outline" className="w-full justify-start text-left" size="lg">
								<PhoneIcon className="h-5 w-5 mr-3 flex-shrink-0" />
								<span className="truncate">Contact Support</span>
							</Button>
						</div>

						<div className="mt-6 p-4 bg-gray-50 rounded-lg">
							<h4 className="font-medium mb-2 text-sm lg:text-base">Need Help?</h4>
							<p className="text-xs lg:text-sm text-gray-600 mb-3">
								Check out our driver resources and FAQ section.
							</p>
							<Button variant="outline" size="sm" className="w-full sm:w-auto">
								Help Center
								<ArrowRightIcon className="h-4 w-4 ml-2" />
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
