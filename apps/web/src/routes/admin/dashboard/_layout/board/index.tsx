import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Activity,
	AlertCircle,
	Calendar,
	Car,
	CheckCircle,
	Clock,
	Loader2,
	MapPin,
	Package,
	Users,
} from "lucide-react";
import {
	AnalyticsCard,
	type AnalyticsCardData,
} from "@/components/analytics-card";
import { DashboardChartCard } from "@/features/dashboard/_components/dashboard-chart-card";
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
			bgGradient: "bg-gradient-to-br from-slate-50/95 to-slate-100/45",
			iconBg: "bg-slate-700",
			accentStripClassName:
				"from-slate-600/55 via-slate-500/38 to-slate-300/25",
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
			bgGradient: "bg-gradient-to-br from-zinc-50/95 to-stone-100/45",
			iconBg: "bg-zinc-600",
			accentStripClassName: "from-zinc-600/50 via-zinc-500/38 to-stone-400/25",
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
			bgGradient: "bg-gradient-to-br from-neutral-50/95 to-neutral-100/45",
			iconBg: "bg-neutral-700",
			accentStripClassName:
				"from-neutral-600/50 via-neutral-500/38 to-stone-400/25",
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
			bgGradient: "bg-gradient-to-br from-amber-50/95 to-amber-100/55",
			iconBg: "bg-amber-700",
			accentStripClassName:
				"from-amber-700/55 via-amber-500/42 to-amber-200/30",
			changeText: `${stats.activeDrivers} active`,
			changeType: "positive",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	const recentActivity = data?.recentActivity || [];

	return (
		<div className="space-y-6 p-4 sm:space-y-8 sm:p-6">
			{/* Welcome Header */}
			<div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
				<p className="font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
					Overview
				</p>
				<div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h1 className="font-semibold text-2xl text-foreground tracking-tight sm:text-3xl">
							Admin dashboard
						</h1>
						<p className="mt-1 max-w-xl text-muted-foreground text-sm sm:text-base">
							Monitor bookings, fleet, and team performance in one place.
						</p>
					</div>
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
			<DashboardChartCard className="transition-shadow hover:shadow-md">
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
			</DashboardChartCard>
		</div>
	);
}
