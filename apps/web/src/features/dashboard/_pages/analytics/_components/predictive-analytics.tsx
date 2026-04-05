import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import {
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Brain, Calendar, Target, TrendingUp } from "lucide-react";
import { DashboardChartCard } from "@/features/dashboard/_components/dashboard-chart-card";

interface AnalyticsData {
	bookingGrowth: {
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
	revenueGrowth: {
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
	totalBookings: number;
	completedBookings: number;
}

interface PredictiveAnalyticsProps {
	dateRange: string;
	analytics?: AnalyticsData | null;
}

export function PredictiveAnalytics({
	dateRange,
	analytics,
}: PredictiveAnalyticsProps) {
	const bookingGrowth = analytics?.bookingGrowth ?? {
		thisMonth: 0,
		lastMonth: 0,
		growth: 0,
	};
	const revenueGrowth = analytics?.revenueGrowth ?? {
		thisMonth: 0,
		lastMonth: 0,
		growth: 0,
	};
	const totalBookings = analytics?.totalBookings ?? 0;
	const completedBookings = analytics?.completedBookings ?? 0;

	// Derive simple projections from real growth data
	const growthPct = bookingGrowth.growth;
	const revenueGrowthPct = revenueGrowth.growth;
	const nextMonthBookings = Math.round(
		bookingGrowth.thisMonth * (1 + growthPct / 100),
	);
	const nextMonthRevenue =
		Math.round((revenueGrowth.thisMonth / 100) * (1 + revenueGrowthPct / 100)) /
		100; // Convert cents back for display

	const completionRate =
		totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

	return (
		<div className="grid gap-4">
			<Alert>
				<Brain className="h-4 w-4" />
				<AlertDescription>
					Projections are derived from your actual booking and revenue growth.
					As more data accumulates, forecasts become more accurate.
				</AlertDescription>
			</Alert>

			<div className="grid gap-4 md:grid-cols-2">
				<DashboardChartCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5 text-blue-600" />
							Demand Forecast
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="font-medium text-sm">This Month Bookings</span>
								<Badge variant="outline">{bookingGrowth.thisMonth}</Badge>
							</div>
							<div className="mb-2 font-bold text-2xl">
								{bookingGrowth.thisMonth} bookings
							</div>
							<Progress
								value={Math.min(
									100,
									(bookingGrowth.thisMonth / Math.max(1, nextMonthBookings)) *
										100,
								)}
								className="h-2"
							/>
						</div>

						<div className="border-t pt-3">
							<div className="flex items-center justify-between">
								<span className="font-medium text-sm">
									Projected Next Month
								</span>
								<span className="font-bold text-green-600 text-lg">
									~{nextMonthBookings} bookings
								</span>
							</div>
							<div className="flex items-center justify-between text-muted-foreground text-sm">
								<span>
									Based on {growthPct >= 0 ? "+" : ""}
									{growthPct}% growth
								</span>
								<span
									className={
										growthPct >= 0
											? "font-medium text-green-600"
											: "font-medium text-red-600"
									}
								>
									{growthPct >= 0 ? "+" : ""}
									{growthPct}%
								</span>
							</div>
						</div>

						<div className="border-t pt-3">
							<div className="flex items-center justify-between">
								<span className="font-medium text-sm">
									Projected Next Month Revenue
								</span>
								<span className="font-bold text-green-600 text-lg">
									$
									{nextMonthRevenue.toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</span>
							</div>
							<div className="flex items-center justify-between text-muted-foreground text-sm">
								<span>
									Based on {revenueGrowthPct >= 0 ? "+" : ""}
									{revenueGrowthPct}% growth
								</span>
								<span
									className={
										revenueGrowthPct >= 0
											? "font-medium text-green-600"
											: "font-medium text-red-600"
									}
								>
									{revenueGrowthPct >= 0 ? "+" : ""}
									{revenueGrowthPct}%
								</span>
							</div>
						</div>
					</CardContent>
				</DashboardChartCard>

				<DashboardChartCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Target className="h-5 w-5 text-purple-600" />
							Performance Summary
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="font-medium text-sm">Completion Rate</span>
								<Badge variant="outline">{completionRate.toFixed(1)}%</Badge>
							</div>
							<Progress value={completionRate} className="h-2" />
							<p className="mt-1 text-muted-foreground text-xs">
								{completedBookings} of {totalBookings} bookings completed
							</p>
						</div>

						<div className="border-t pt-3">
							<div className="flex items-center justify-between">
								<span className="font-medium text-sm">Booking Growth</span>
								<span
									className={`font-medium ${growthPct >= 0 ? "text-green-600" : "text-red-600"}`}
								>
									{growthPct >= 0 ? "+" : ""}
									{growthPct}%
								</span>
							</div>
							<p className="mt-1 text-muted-foreground text-xs">
								{bookingGrowth.thisMonth} this month vs{" "}
								{bookingGrowth.lastMonth} last month
							</p>
						</div>

						<div className="border-t pt-3">
							<div className="flex items-center justify-between">
								<span className="font-medium text-sm">Revenue Growth</span>
								<span
									className={`font-medium ${revenueGrowthPct >= 0 ? "text-green-600" : "text-red-600"}`}
								>
									{revenueGrowthPct >= 0 ? "+" : ""}
									{revenueGrowthPct}%
								</span>
							</div>
							<p className="mt-1 text-muted-foreground text-xs">
								$
								{(revenueGrowth.thisMonth / 100).toLocaleString(undefined, {
									minimumFractionDigits: 2,
								})}{" "}
								this month vs $
								{(revenueGrowth.lastMonth / 100).toLocaleString(undefined, {
									minimumFractionDigits: 2,
								})}{" "}
								last month
							</p>
						</div>
					</CardContent>
				</DashboardChartCard>
			</div>

			{totalBookings === 0 && (
				<DashboardChartCard>
					<CardContent>
						<p className="text-center text-muted-foreground text-sm">
							No bookings yet. Projections will appear once you have booking and
							revenue data.
						</p>
					</CardContent>
				</DashboardChartCard>
			)}
		</div>
	);
}
