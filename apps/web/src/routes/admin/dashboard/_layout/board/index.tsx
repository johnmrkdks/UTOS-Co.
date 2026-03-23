import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Activity,
	AlertCircle,
	BarChart3,
	Calendar,
	Car,
	CheckCircle,
	Clock,
	DollarSign,
	Loader2,
	MapPin,
	Package,
	PieChart,
	Settings,
	Star,
	TrendingUp,
	Users,
} from "lucide-react";
import {
	AnalyticsCard,
	type AnalyticsCardData,
} from "@/components/analytics-card";
import {
	formatDashboardAnalytics,
	useGetDashboardAnalyticsEnhancedQuery,
} from "@/features/dashboard/_hooks/query/use-get-dashboard-analytics-enhanced-query";
import { useGetCarsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-get-cars-query";

export const Route = createFileRoute("/admin/dashboard/_layout/board/")({
	component: AdminDashboard,
});

function AdminDashboard() {
	const {
		data: analyticsData,
		isLoading,
		error,
	} = useGetDashboardAnalyticsEnhancedQuery();
	const { data: carsData, isLoading: carsLoading } = useGetCarsQuery({
		limit: 1000,
	}); // Get all cars for count
	const data = formatDashboardAnalytics(analyticsData);

	if (isLoading || carsLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="flex items-center gap-2">
					<Loader2 className="h-6 w-6 animate-spin" />
					<span className="text-muted-foreground">
						Loading dashboard data...
					</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="space-y-2 text-center">
					<AlertCircle className="mx-auto h-8 w-8 text-red-500" />
					<p className="text-muted-foreground">Failed to load dashboard data</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => window.location.reload()}
					>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	const stats = data?.stats || {
		totalBookings: 0,
		activeBookings: 0,
		totalRevenue: 0,
		monthlyRevenue: 0,
		totalPackages: 0,
		activePackages: 0,
		totalDrivers: 0,
		activeDrivers: 0,
		avgRating: 0,
		completionRate: 0,
	};

	// Calculate vehicle stats
	const totalVehicles = carsData?.data?.length || 0;
	const availableVehicles =
		carsData?.data?.filter((car: any) => {
			return car.isAvailable === true && car.isActive === true;
		}).length || 0;

	// Analytics card data for admin dashboard
	const adminAnalyticsData: AnalyticsCardData[] = [
		{
			id: "bookings",
			title: "Bookings",
			value: stats.totalBookings,
			icon: Calendar,
			bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
			iconBg: "bg-blue-500",
			changeText: `+${stats.activeBookings} active`,
			changeType: "positive",
			showTrend: true,
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "vehicles",
			title: "Vehicles",
			value: totalVehicles,
			icon: Car,
			bgGradient: "bg-gradient-to-br from-green-50 to-green-100",
			iconBg: "bg-green-500",
			changeText: `${availableVehicles} available`,
			changeType: "neutral",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "packages",
			title: "Packages",
			value: stats.totalPackages,
			icon: Package,
			bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100",
			iconBg: "bg-purple-500",
			changeText: `${stats.activePackages} active`,
			changeType: "neutral",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "drivers",
			title: "Drivers",
			value: stats.totalDrivers,
			icon: Users,
			bgGradient: "bg-gradient-to-br from-orange-50 to-orange-100",
			iconBg: "bg-orange-500",
			changeText: `${stats.activeDrivers} active`,
			changeType: "positive",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	const recentActivity = data?.recentActivity || [];

	return (
		<div className="space-y-4 p-4 sm:space-y-6">
			{/* Welcome Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-foreground text-xl sm:text-2xl lg:text-3xl">
						Admin Dashboard
					</h1>
					<p className="text-muted-foreground text-sm sm:text-base">
						Monitor and manage your luxury chauffeur service
					</p>
				</div>
			</div>

			{/* Key Metrics - Mobile First Grid */}
			<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				{adminAnalyticsData.map((data) => (
					<AnalyticsCard
						key={data.id}
						data={data}
						view="compact"
						className="touch-manipulation transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
					/>
				))}
			</div>

			{/* Recent Activity */}
			<Card className="transition-shadow hover:shadow-md">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
								<Activity className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
							</div>
							<div>
								<CardTitle className="font-bold text-lg sm:text-xl">
									Recent Activity
								</CardTitle>
								<CardDescription className="hidden text-sm sm:block">
									Latest system events and updates
								</CardDescription>
							</div>
						</div>
						{/* <Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild> */}
						{/* 	<a href="/admin/dashboard/analytics">View Reports</a> */}
						{/* </Button> */}
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-3 sm:space-y-4">
						{recentActivity.length === 0 ? (
							<div className="py-8 text-center text-muted-foreground">
								<Activity className="mx-auto mb-2 h-8 w-8 opacity-50" />
								<p>No recent activity</p>
								<p className="text-xs">
									Activity will appear here when bookings are created
								</p>
							</div>
						) : (
							recentActivity.map((activity: any) => (
								<div
									key={activity.id}
									className="flex items-center justify-between rounded-lg border p-3 transition-all duration-200 hover:bg-muted/30 hover:shadow-sm sm:p-4"
								>
									<div className="flex min-w-0 flex-1 items-center gap-3">
										<div
											className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
												activity.type === "package" ||
												activity.type === "custom"
													? "bg-blue-100"
													: activity.type === "driver"
														? "bg-green-100"
														: "bg-muted"
											}`}
										>
											{activity.type === "package" ||
											activity.type === "custom" ? (
												<Calendar className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
											) : (
												<Car className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
											)}
										</div>
										<div className="min-w-0 flex-1">
											<div className="mb-1 flex flex-wrap items-center gap-2">
												<h4 className="truncate font-medium text-foreground text-sm sm:text-base">
													{activity.title}
												</h4>
												<Badge
													variant={
														activity.status === "completed"
															? "default"
															: "secondary"
													}
													className={`px-2 py-0.5 text-xs ${
														activity.status === "completed"
															? "border-green-200 bg-green-100 text-green-700"
															: activity.status === "confirmed"
																? "border-blue-200 bg-blue-100 text-blue-700"
																: activity.status === "pending"
																	? "border-orange-200 bg-orange-100 text-orange-700"
																	: "bg-muted text-muted-foreground"
													}`}
												>
													{activity.status}
												</Badge>
											</div>
											<p className="truncate text-muted-foreground text-xs sm:text-sm">
												{activity.description}
											</p>
											<div className="mt-1 flex items-center gap-1">
												<Clock className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
												<span className="text-muted-foreground text-xs">
													{activity.time}
												</span>
											</div>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
