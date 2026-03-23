import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
	Car,
	DollarSign,
	Download,
	Loader2,
	TrendingUp,
	Users,
} from "lucide-react";
import { useState } from "react";
import {
	type DateRangePreset,
	formatDashboardAnalytics,
	useGetDashboardAnalyticsEnhancedQuery,
} from "@/features/dashboard/_hooks/query/use-get-dashboard-analytics-enhanced-query";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { BookingPerformance } from "./_components/booking-performance";
import { CustomerSatisfaction } from "./_components/customer-satisfaction";
import { DriverAnalytics } from "./_components/driver-analytics";
import { PredictiveAnalytics } from "./_components/predictive-analytics";
import { RealTimeMetrics } from "./_components/real-time-metrics";
import { RevenueAnalytics } from "./_components/revenue-analytics";

export function AdvancedAnalyticsPage() {
	const [dateRange, setDateRange] = useState<DateRangePreset>("30d");
	const [isExporting, setIsExporting] = useState(false);

	const {
		data: analyticsData,
		isLoading,
		error,
	} = useGetDashboardAnalyticsEnhancedQuery(dateRange);
	const data = formatDashboardAnalytics(analyticsData);
	const stats = data?.stats ?? null;

	const handleExport = async () => {
		if (!stats) return;
		setIsExporting(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));
			const reportData = {
				dateRange,
				generatedAt: new Date().toISOString(),
				metrics: {
					totalRevenue: (stats.totalRevenue ?? 0) / 100,
					totalBookings: stats.totalBookings ?? 0,
					completedBookings: stats.completedBookings ?? 0,
					completionRate: stats.completionRate ?? 0,
					activeDrivers: stats.activeDrivers ?? 0,
					totalDrivers: stats.totalDrivers ?? 0,
					driverUtilization: stats.totalDrivers
						? Math.round(
								((stats.activeDrivers ?? 0) / stats.totalDrivers) * 100,
							)
						: 0,
				},
			};
			const blob = new Blob([JSON.stringify(reportData, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `analytics-report-${dateRange}-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} finally {
			setIsExporting(false);
		}
	};

	if (isLoading) {
		return (
			<PaddingLayout className="flex min-h-[300px] flex-1 items-center justify-center">
				<div className="flex items-center gap-2 text-muted-foreground">
					<Loader2 className="h-6 w-6 animate-spin" />
					Loading analytics...
				</div>
			</PaddingLayout>
		);
	}

	if (error) {
		return (
			<PaddingLayout className="flex min-h-[300px] flex-1 items-center justify-center">
				<div className="text-center text-destructive">
					<p>Failed to load analytics</p>
					<p className="mt-1 text-muted-foreground text-sm">{String(error)}</p>
				</div>
			</PaddingLayout>
		);
	}

	const revenueGrowth = data?.growth?.revenue?.growth ?? 0;
	const bookingGrowth = data?.growth?.bookings?.growth ?? 0;
	const driverUtilization = stats?.totalDrivers
		? Math.round(((stats.activeDrivers ?? 0) / stats.totalDrivers) * 100)
		: 0;

	return (
		<PaddingLayout className="flex-1 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Advanced Analytics</h1>
					<p className="text-gray-600">
						Comprehensive insights and performance metrics
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Select value={dateRange} onValueChange={setDateRange}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7d">Last 7 days</SelectItem>
							<SelectItem value="30d">Last 30 days</SelectItem>
							<SelectItem value="90d">Last 90 days</SelectItem>
							<SelectItem value="1y">Last year</SelectItem>
						</SelectContent>
					</Select>
					<Button onClick={handleExport} disabled={isExporting || !stats}>
						<Download className="mr-2 h-4 w-4" />
						{isExporting ? "Generating..." : "Export Report"}
					</Button>
				</div>
			</div>

			{/* Key Metrics Overview - Real data from API */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							$
							{((stats?.totalRevenue ?? 0) / 100).toLocaleString(undefined, {
								minimumFractionDigits: 2,
							})}
						</div>
						<p className="text-muted-foreground text-xs">
							{revenueGrowth >= 0 ? "+" : ""}
							{revenueGrowth}% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Total Bookings
						</CardTitle>
						<Car className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{stats?.totalBookings ?? 0}
						</div>
						<p className="text-muted-foreground text-xs">
							{bookingGrowth >= 0 ? "+" : ""}
							{bookingGrowth}% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Completion Rate
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{stats?.completionRate ?? 0}%
						</div>
						<p className="text-muted-foreground text-xs">
							{stats?.completedBookings ?? 0} completed
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Driver Utilization
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{driverUtilization}%</div>
						<p className="text-muted-foreground text-xs">
							{stats?.activeDrivers ?? 0} of {stats?.totalDrivers ?? 0} active
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Tabs defaultValue="revenue" className="w-full">
						<TabsList className="grid w-full grid-cols-5">
							<TabsTrigger value="revenue">Revenue</TabsTrigger>
							<TabsTrigger value="bookings">Bookings</TabsTrigger>
							<TabsTrigger value="drivers">Drivers</TabsTrigger>
							<TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
							<TabsTrigger value="predictive">Predictive</TabsTrigger>
						</TabsList>

						<TabsContent value="revenue" className="space-y-4">
							<RevenueAnalytics
								dateRange={dateRange}
								analytics={
									analyticsData
										? {
												totalRevenue: analyticsData.totalRevenue,
												monthlyRevenue: analyticsData.monthlyRevenue,
												revenueGrowth: analyticsData.revenueGrowth,
												revenueByType: analyticsData.revenueByType,
											}
										: undefined
								}
							/>
						</TabsContent>

						<TabsContent value="bookings" className="space-y-4">
							<BookingPerformance
								dateRange={dateRange}
								analytics={
									analyticsData
										? {
												totalBookings: analyticsData.totalBookings,
												completedBookings: analyticsData.completedBookings,
												cancelledBookings: analyticsData.cancelledBookings,
												completionRate: analyticsData.completionRate,
												cancellationRate: analyticsData.cancellationRate,
											}
										: undefined
								}
							/>
						</TabsContent>

						<TabsContent value="drivers" className="space-y-4">
							<DriverAnalytics
								dateRange={dateRange}
								analytics={
									analyticsData
										? {
												totalDrivers: analyticsData.totalDrivers,
												activeDrivers: analyticsData.activeDrivers,
												pendingDrivers: analyticsData.pendingDrivers,
											}
										: undefined
								}
							/>
						</TabsContent>

						<TabsContent value="satisfaction" className="space-y-4">
							<CustomerSatisfaction
								dateRange={dateRange}
								analytics={analyticsData?.reviews}
							/>
						</TabsContent>

						<TabsContent value="predictive" className="space-y-4">
							<PredictiveAnalytics
								dateRange={dateRange}
								analytics={
									analyticsData
										? {
												bookingGrowth: analyticsData.bookingGrowth,
												revenueGrowth: analyticsData.revenueGrowth,
												totalBookings: analyticsData.totalBookings,
												completedBookings: analyticsData.completedBookings,
											}
										: undefined
								}
							/>
						</TabsContent>
					</Tabs>
				</div>

				<div>
					<RealTimeMetrics
						analytics={
							analyticsData
								? {
										activeBookings: analyticsData.activeBookings,
										activeDrivers: analyticsData.activeDrivers,
										totalDrivers: analyticsData.totalDrivers,
										monthlyRevenue: analyticsData.monthlyRevenue,
										recentBookings: analyticsData.recentBookings,
									}
								: undefined
						}
					/>
				</div>
			</div>
		</PaddingLayout>
	);
}
