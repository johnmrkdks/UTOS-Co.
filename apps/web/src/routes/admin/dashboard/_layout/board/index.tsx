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
	Clock,
	Loader2,
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
	const strip = "from-foreground/18 via-foreground/8 to-transparent" as const;
	const adminAnalyticsData: AnalyticsCardData[] = [
		{
			id: "bookings",
			title: "Bookings",
			value: stats.totalBookings,
			icon: Calendar,
			bgGradient: "bg-card",
			iconBg: "bg-foreground/88",
			accentStripClassName: strip,
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
			bgGradient: "bg-card",
			iconBg: "bg-foreground/88",
			accentStripClassName: strip,
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
			bgGradient: "bg-card",
			iconBg: "bg-foreground/88",
			accentStripClassName: strip,
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
			bgGradient: "bg-card",
			iconBg: "bg-foreground/88",
			accentStripClassName: strip,
			changeText: `${stats.activeDrivers} active`,
			changeType: "positive",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	const recentActivity = data?.recentActivity || [];

	return (
		<div className="space-y-8 py-6 sm:space-y-10 sm:py-8">
			{/* Welcome Header */}
			<div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
				<p className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.16em]">
					Overview
				</p>
				<div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h1 className="font-semibold text-2xl text-foreground tracking-tight sm:text-3xl">
							Admin dashboard
						</h1>
						<p className="mt-1 max-w-xl text-muted-foreground text-sm leading-relaxed">
							Bookings, fleet, packages, and drivers — live snapshot of your
							operation.
						</p>
					</div>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				{adminAnalyticsData.map((data) => (
					<AnalyticsCard
						key={data.id}
						data={data}
						view="compact"
						className="touch-manipulation border-border/50 shadow-none hover:shadow-none"
					/>
				))}
			</div>

			{/* Recent Activity */}
			<DashboardChartCard>
				<CardHeader className="border-border/50 border-b pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted sm:h-10 sm:w-10">
								<Activity className="h-4 w-4 text-foreground sm:h-[18px] sm:w-[18px]" />
							</div>
							<div>
								<CardTitle className="font-semibold text-base tracking-tight sm:text-lg">
									Recent activity
								</CardTitle>
								<CardDescription className="hidden text-sm sm:block">
									Latest bookings and fleet-related events
								</CardDescription>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-4">
					<div className="space-y-2 sm:space-y-3">
						{recentActivity.length === 0 ? (
							<div className="rounded-lg border border-border/60 border-dashed bg-muted/20 px-4 py-10 text-center">
								<div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
									<Activity className="h-5 w-5 text-muted-foreground" />
								</div>
								<p className="font-medium text-foreground text-sm">
									No recent activity yet
								</p>
								<p className="mx-auto mt-1 max-w-sm text-muted-foreground text-xs leading-relaxed">
									When customers create bookings, they will show up here with
									status and timing.
								</p>
							</div>
						) : (
							recentActivity.map((activity: any) => (
								<div
									key={activity.id}
									className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-3 transition-colors hover:bg-muted/30 sm:p-3.5"
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
