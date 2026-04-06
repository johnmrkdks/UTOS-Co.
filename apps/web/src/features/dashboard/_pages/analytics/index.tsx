import { Button } from "@workspace/ui/components/button";
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
import * as XLSX from "xlsx";
import { DashboardKpiCard } from "@/features/dashboard/_components/dashboard-kpi-card";
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

function dateRangePresetLabel(preset: DateRangePreset): string {
	const labels: Record<DateRangePreset, string> = {
		"7d": "Last 7 days",
		"30d": "Last 30 days",
		"90d": "Last 90 days",
		"1y": "Last year",
	};
	return labels[preset];
}

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

	const handleExport = () => {
		if (!stats) return;
		setIsExporting(true);
		try {
			const workbook = XLSX.utils.book_new();
			const generatedAt = new Date().toISOString();
			const revenueGrowthPct = data.growth?.revenue?.growth ?? 0;
			const bookingGrowthPct = data.growth?.bookings?.growth ?? 0;
			const driverUtilizationPct = stats.totalDrivers
				? Math.round(((stats.activeDrivers ?? 0) / stats.totalDrivers) * 100)
				: 0;

			const summaryRows: (string | number)[][] = [
				["Utos & Co. — Advanced analytics export"],
				[],
				["Date range", dateRangePresetLabel(dateRange)],
				["Generated at (UTC)", generatedAt],
				[],
				["Metric", "Value"],
				["Total revenue ($)", (stats.totalRevenue ?? 0) / 100],
				["Revenue growth vs prior period (%)", revenueGrowthPct],
				["Total bookings", stats.totalBookings ?? 0],
				["Booking growth vs prior period (%)", bookingGrowthPct],
				["Completed bookings", stats.completedBookings ?? 0],
				["Completion rate (%)", stats.completionRate ?? 0],
				["Active drivers", stats.activeDrivers ?? 0],
				["Total drivers", stats.totalDrivers ?? 0],
				["Driver utilization (%)", driverUtilizationPct],
			];

			const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
			XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

			if (analyticsData?.revenueByType) {
				const r = analyticsData.revenueByType;
				const typeRows: (string | number)[][] = [
					["Booking type", "Bookings", "Revenue ($)"],
					["Package", r.package.count, r.package.revenue / 100],
					["Custom", r.custom.count, r.custom.revenue / 100],
					["Offload", r.offload.count, r.offload.revenue / 100],
				];
				XLSX.utils.book_append_sheet(
					workbook,
					XLSX.utils.aoa_to_sheet(typeRows),
					"Revenue by type",
				);
			}

			const dateStr = new Date().toISOString().split("T")[0];
			XLSX.writeFile(workbook, `analytics-report-${dateRange}-${dateStr}.xlsx`);
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
		<PaddingLayout className="flex-1 space-y-6">
			<div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur-sm sm:p-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
							Insights
						</p>
						<h1 className="mt-1 font-semibold text-2xl text-foreground tracking-tight sm:text-3xl">
							Advanced analytics
						</h1>
						<p className="mt-1 max-w-xl text-muted-foreground text-sm sm:text-base">
							Revenue, bookings, drivers, and forecasts in one place.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<Select value={dateRange} onValueChange={setDateRange}>
							<SelectTrigger className="w-36 rounded-xl border-border/60 bg-background">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="7d">Last 7 days</SelectItem>
								<SelectItem value="30d">Last 30 days</SelectItem>
								<SelectItem value="90d">Last 90 days</SelectItem>
								<SelectItem value="1y">Last year</SelectItem>
							</SelectContent>
						</Select>
						<Button
							className="rounded-xl"
							onClick={handleExport}
							disabled={isExporting || !stats}
						>
							<Download className="mr-2 h-4 w-4" />
							{isExporting ? "Generating..." : "Export Report"}
						</Button>
					</div>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<DashboardKpiCard
					accent="emerald"
					icon={DollarSign}
					title="Total revenue"
					value={`$${((stats?.totalRevenue ?? 0) / 100).toLocaleString(
						undefined,
						{
							minimumFractionDigits: 2,
						},
					)}`}
					subtitle={`${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% vs prior period`}
				/>
				<DashboardKpiCard
					accent="slate"
					icon={Car}
					title="Total bookings"
					value={stats?.totalBookings ?? 0}
					subtitle={`${bookingGrowth >= 0 ? "+" : ""}${bookingGrowth}% vs prior period`}
				/>
				<DashboardKpiCard
					accent="violet"
					icon={Users}
					title="Completion rate"
					value={`${stats?.completionRate ?? 0}%`}
					subtitle={`${stats?.completedBookings ?? 0} trips completed`}
				/>
				<DashboardKpiCard
					accent="gold"
					icon={TrendingUp}
					title="Driver utilization"
					value={`${driverUtilization}%`}
					subtitle={`${stats?.activeDrivers ?? 0} of ${stats?.totalDrivers ?? 0} drivers active`}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Tabs defaultValue="revenue" className="w-full">
						<TabsList className="grid h-auto min-h-11 w-full grid-cols-2 gap-1 rounded-2xl border border-border/60 bg-muted/40 p-1.5 sm:grid-cols-5">
							<TabsTrigger
								className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
								value="revenue"
							>
								Revenue
							</TabsTrigger>
							<TabsTrigger
								className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
								value="bookings"
							>
								Bookings
							</TabsTrigger>
							<TabsTrigger
								className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
								value="drivers"
							>
								Drivers
							</TabsTrigger>
							<TabsTrigger
								className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
								value="satisfaction"
							>
								Satisfaction
							</TabsTrigger>
							<TabsTrigger
								className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
								value="predictive"
							>
								Predictive
							</TabsTrigger>
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
