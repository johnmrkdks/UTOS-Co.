import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { useGetDashboardAnalyticsEnhancedQuery } from "@/features/dashboard/_hooks/query/use-get-dashboard-analytics-enhanced-query";

type DetailsReportsChartProps = {
	className?: string;
};

export function DetailsReportsChart({
	className,
}: DetailsReportsChartProps) {
	const { data: analyticsData, isLoading, error } = useGetDashboardAnalyticsEnhancedQuery();

	const chartData = analyticsData
		? [
				{ name: "Completed", count: analyticsData.completedBookings ?? 0, fill: "#22c55e" },
				{ name: "Pending", count: analyticsData.pendingBookings ?? 0, fill: "#f59e0b" },
				{ name: "Active", count: analyticsData.activeBookings ?? 0, fill: "#3b82f6" },
				{ name: "Cancelled", count: analyticsData.cancelledBookings ?? 0, fill: "#ef4444" },
		  ]
		: [];

	if (isLoading) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle>Booking Status Breakdown</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[300px] flex items-center justify-center text-muted-foreground">
						Loading chart...
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle>Booking Status Breakdown</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[300px] flex items-center justify-center text-destructive">
						Failed to load chart data
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Booking Status Breakdown</CardTitle>
				<p className="text-sm text-muted-foreground">Distribution of bookings by status</p>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis />
						<Tooltip />
						<Bar dataKey="count" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
