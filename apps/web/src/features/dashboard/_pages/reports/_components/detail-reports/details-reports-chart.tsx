import {
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { DashboardChartCard } from "@/features/dashboard/_components/dashboard-chart-card";
import { useGetDashboardAnalyticsEnhancedQuery } from "@/features/dashboard/_hooks/query/use-get-dashboard-analytics-enhanced-query";

type DetailsReportsChartProps = {
	className?: string;
};

export function DetailsReportsChart({ className }: DetailsReportsChartProps) {
	const {
		data: analyticsData,
		isLoading,
		error,
	} = useGetDashboardAnalyticsEnhancedQuery();

	const chartData = analyticsData
		? [
				{
					name: "Completed",
					count: analyticsData.completedBookings ?? 0,
					fill: "#16a34a",
				},
				{
					name: "Pending",
					count: analyticsData.pendingBookings ?? 0,
					fill: "#d97706",
				},
				{
					name: "Active",
					count: analyticsData.activeBookings ?? 0,
					fill: "#2563eb",
				},
				{
					name: "Cancelled",
					count: analyticsData.cancelledBookings ?? 0,
					fill: "#dc2626",
				},
			]
		: [];

	if (isLoading) {
		return (
			<DashboardChartCard className={className}>
				<CardHeader>
					<CardTitle>Booking status breakdown</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-[300px] items-center justify-center text-muted-foreground">
						Loading chart...
					</div>
				</CardContent>
			</DashboardChartCard>
		);
	}

	if (error) {
		return (
			<DashboardChartCard className={className}>
				<CardHeader>
					<CardTitle>Booking status breakdown</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-[300px] items-center justify-center text-destructive">
						Failed to load chart data
					</div>
				</CardContent>
			</DashboardChartCard>
		);
	}

	return (
		<DashboardChartCard className={cn("min-h-0", className)}>
			<CardHeader>
				<CardTitle>Booking status breakdown</CardTitle>
				<p className="text-muted-foreground text-sm">
					Distribution of bookings by status
				</p>
			</CardHeader>
			<CardContent>
				<div className="rounded-xl border border-border/50 bg-muted/20 p-2">
					<ResponsiveContainer width="100%" height={300}>
						<BarChart
							data={chartData}
							margin={{ top: 16, right: 16, left: 4, bottom: 8 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								className="stroke-border/50"
							/>
							<XAxis
								dataKey="name"
								tick={{ fontSize: 12 }}
								className="text-muted-foreground"
							/>
							<YAxis
								tick={{ fontSize: 12 }}
								className="text-muted-foreground"
							/>
							<Tooltip
								contentStyle={{
									borderRadius: "0.75rem",
									border: "1px solid oklch(0.9 0.008 260)",
								}}
							/>
							<Bar dataKey="count" name="Bookings" radius={[6, 6, 0, 0]}>
								{chartData.map((entry) => (
									<Cell key={entry.name} fill={entry.fill} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</DashboardChartCard>
	);
}
