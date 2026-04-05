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
			bgGradient:
				"bg-gradient-to-br from-card via-slate-50/40 to-slate-100/30",
			iconBg: "bg-gradient-to-br from-slate-600 to-slate-800",
			accentStripClassName:
				"from-slate-600/65 via-slate-500/45 to-slate-400/30",
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
			bgGradient:
				"bg-gradient-to-br from-card via-zinc-50/35 to-stone-100/25",
			iconBg: "bg-gradient-to-br from-zinc-500 to-zinc-700",
			accentStripClassName:
				"from-zinc-600/55 via-zinc-500/40 to-stone-400/28",
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
			bgGradient:
				"bg-gradient-to-br from-card via-neutral-50/35 to-stone-50/30",
			iconBg: "bg-gradient-to-br from-neutral-600 to-neutral-800",
			accentStripClassName:
				"from-neutral-600/55 via-neutral-500/42 to-stone-400/28",
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
			bgGradient:
				"bg-gradient-to-br from-card via-amber-50/30 to-amber-100/20",
			iconBg: "bg-gradient-to-br from-amber-600 to-amber-900",
			accentStripClassName:
				"from-amber-700/60 via-amber-500/45 to-amber-300/35",
			changeText: `${stats.activeDrivers} active`,
			changeType: "positive",
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	const recentActivity = data?.recentActivity || [];

	return (
		<div className="space-y-8 p-4 sm:space-y-10 sm:p-6">
			{/* Welcome Header */}
			<div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-5 shadow-[0_1px_0_0_oklch(1_0_0/0.85)_inset,0_12px_48px_-24px_oklch(0.35_0.04_260/0.14)] sm:p-7">
				<div
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,oklch(0.88_0.06_75/0.14),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_100%,oklch(0.85_0.04_265/0.08),transparent_50%)]"
					aria-hidden
				/>
				<div className="relative">
					<p className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.22em]">
						Overview
					</p>
					<div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h1 className="font-semibold text-2xl text-foreground tracking-tight sm:text-3xl">
								Admin dashboard
							</h1>
							<p className="mt-1.5 max-w-xl text-muted-foreground text-sm leading-relaxed sm:text-base">
								Bookings, fleet, packages, and drivers — live snapshot of your
								operation.
							</p>
						</div>
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
						className="touch-manipulation"
					/>
				))}
			</div>

			{/* Recent Activity */}
			<DashboardChartCard className="border-border/50 bg-card/95 shadow-[0_1px_0_0_oklch(1_0_0/0.8)_inset,0_12px_40px_-20px_oklch(0.35_0.03_260/0.1)]">
				<CardHeader className="border-border/40 border-b bg-gradient-to-r from-muted/25 to-transparent pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/15 sm:h-11 sm:w-11">
								<Activity className="h-5 w-5 text-primary sm:h-5 sm:w-5" />
							</div>
							<div>
								<CardTitle className="font-semibold text-lg tracking-tight sm:text-xl">
									Recent activity
								</CardTitle>
								<CardDescription className="hidden text-sm sm:block">
									Latest bookings and fleet-related events
								</CardDescription>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-5">
					<div className="space-y-3 sm:space-y-4">
						{recentActivity.length === 0 ? (
							<div className="rounded-xl border border-border/50 border-dashed bg-muted/15 px-4 py-12 text-center">
								<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/60">
									<Activity className="h-6 w-6 text-muted-foreground/70" />
								</div>
								<p className="font-medium text-foreground text-sm">
									No recent activity yet
								</p>
								<p className="mx-auto mt-1 max-w-sm text-muted-foreground text-xs leading-relaxed sm:text-sm">
									When customers create bookings, they will show up here with
									status and timing.
								</p>
							</div>
						) : (
							recentActivity.map((activity: any) => (
								<div
									key={activity.id}
									className="flex items-center justify-between rounded-xl border border-border/45 bg-card/30 p-3 transition-all duration-200 hover:border-border/60 hover:bg-muted/25 hover:shadow-sm sm:p-4"
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
