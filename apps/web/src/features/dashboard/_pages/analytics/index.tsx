import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { CalendarIcon, Download, TrendingUp, Users, Car, DollarSign } from "lucide-react";
import { useState } from "react";
import { RevenueAnalytics } from "./_components/revenue-analytics";
import { BookingPerformance } from "./_components/booking-performance";
import { DriverAnalytics } from "./_components/driver-analytics";
import { CustomerSatisfaction } from "./_components/customer-satisfaction";
import { PredictiveAnalytics } from "./_components/predictive-analytics";
import { RealTimeMetrics } from "./_components/real-time-metrics";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";

export function AdvancedAnalyticsPage() {
	const [dateRange, setDateRange] = useState("30d");
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			// Simulate report generation
			await new Promise(resolve => setTimeout(resolve, 2000));

			// In a real implementation, this would generate and download a report
			const reportData = {
				dateRange,
				generatedAt: new Date().toISOString(),
				metrics: {
					totalRevenue: 45750,
					totalBookings: 324,
					averageRating: 4.7,
					driverUtilization: 87,
				},
			};

			const blob = new Blob([JSON.stringify(reportData, null, 2)], {
				type: 'application/json'
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `analytics-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<PaddingLayout className="flex-1 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Advanced Analytics</h1>
					<p className="text-gray-600">Comprehensive insights and performance metrics</p>
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
					<Button onClick={handleExport} disabled={isExporting}>
						<Download className="h-4 w-4 mr-2" />
						{isExporting ? "Generating..." : "Export Report"}
					</Button>
				</div>
			</div>

			{/* Key Metrics Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$45,750</div>
						<p className="text-xs text-muted-foreground">
							+12.5% from last period
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
						<Car className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">324</div>
						<p className="text-xs text-muted-foreground">
							+8.2% from last period
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">4.7</div>
						<p className="text-xs text-muted-foreground">
							+0.3 from last period
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Driver Utilization</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">87%</div>
						<p className="text-xs text-muted-foreground">
							+5.1% from last period
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
							<RevenueAnalytics dateRange={dateRange} />
						</TabsContent>

						<TabsContent value="bookings" className="space-y-4">
							<BookingPerformance dateRange={dateRange} />
						</TabsContent>

						<TabsContent value="drivers" className="space-y-4">
							<DriverAnalytics dateRange={dateRange} />
						</TabsContent>

						<TabsContent value="satisfaction" className="space-y-4">
							<CustomerSatisfaction dateRange={dateRange} />
						</TabsContent>

						<TabsContent value="predictive" className="space-y-4">
							<PredictiveAnalytics dateRange={dateRange} />
						</TabsContent>
					</Tabs>
				</div>

				<div>
					<RealTimeMetrics />
				</div>
			</div>
		</PaddingLayout>
	);
}
