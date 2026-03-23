import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
	TrendingUp,
	Brain,
	Calendar,
	Target,
} from "lucide-react";

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

export function PredictiveAnalytics({ dateRange, analytics }: PredictiveAnalyticsProps) {
	const bookingGrowth = analytics?.bookingGrowth ?? { thisMonth: 0, lastMonth: 0, growth: 0 };
	const revenueGrowth = analytics?.revenueGrowth ?? { thisMonth: 0, lastMonth: 0, growth: 0 };
	const totalBookings = analytics?.totalBookings ?? 0;
	const completedBookings = analytics?.completedBookings ?? 0;

	// Derive simple projections from real growth data
	const growthPct = bookingGrowth.growth;
	const revenueGrowthPct = revenueGrowth.growth;
	const nextMonthBookings = Math.round(
		bookingGrowth.thisMonth * (1 + growthPct / 100)
	);
	const nextMonthRevenue = Math.round(
		(revenueGrowth.thisMonth / 100) * (1 + revenueGrowthPct / 100)
	) / 100; // Convert cents back for display

	const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

	return (
		<div className="grid gap-4">
			<Alert>
				<Brain className="h-4 w-4" />
				<AlertDescription>
					Projections are derived from your actual booking and revenue growth. As more data accumulates, forecasts become more accurate.
				</AlertDescription>
			</Alert>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5 text-blue-600" />
							Demand Forecast
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium">This Month Bookings</span>
								<Badge variant="outline">{bookingGrowth.thisMonth}</Badge>
							</div>
							<div className="text-2xl font-bold mb-2">
								{bookingGrowth.thisMonth} bookings
							</div>
							<Progress
								value={Math.min(100, (bookingGrowth.thisMonth / Math.max(1, nextMonthBookings)) * 100)}
								className="h-2"
							/>
						</div>

						<div className="pt-3 border-t">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Projected Next Month</span>
								<span className="text-lg font-bold text-green-600">
									~{nextMonthBookings} bookings
								</span>
							</div>
							<div className="flex justify-between items-center text-sm text-muted-foreground">
								<span>Based on {growthPct >= 0 ? "+" : ""}{growthPct}% growth</span>
								<span className={growthPct >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
									{growthPct >= 0 ? "+" : ""}{growthPct}%
								</span>
							</div>
						</div>

						<div className="pt-3 border-t">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Projected Next Month Revenue</span>
								<span className="text-lg font-bold text-green-600">
									${nextMonthRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
								</span>
							</div>
							<div className="flex justify-between items-center text-sm text-muted-foreground">
								<span>Based on {revenueGrowthPct >= 0 ? "+" : ""}{revenueGrowthPct}% growth</span>
								<span className={revenueGrowthPct >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
									{revenueGrowthPct >= 0 ? "+" : ""}{revenueGrowthPct}%
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Target className="h-5 w-5 text-purple-600" />
							Performance Summary
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium">Completion Rate</span>
								<Badge variant="outline">{completionRate.toFixed(1)}%</Badge>
							</div>
							<Progress value={completionRate} className="h-2" />
							<p className="text-xs text-muted-foreground mt-1">
								{completedBookings} of {totalBookings} bookings completed
							</p>
						</div>

						<div className="pt-3 border-t">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Booking Growth</span>
								<span className={`font-medium ${growthPct >= 0 ? "text-green-600" : "text-red-600"}`}>
									{growthPct >= 0 ? "+" : ""}{growthPct}%
								</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								{bookingGrowth.thisMonth} this month vs {bookingGrowth.lastMonth} last month
							</p>
						</div>

						<div className="pt-3 border-t">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Revenue Growth</span>
								<span className={`font-medium ${revenueGrowthPct >= 0 ? "text-green-600" : "text-red-600"}`}>
									{revenueGrowthPct >= 0 ? "+" : ""}{revenueGrowthPct}%
								</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								${(revenueGrowth.thisMonth / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} this month vs ${(revenueGrowth.lastMonth / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} last month
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{totalBookings === 0 && (
				<Card>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground text-center">
							No bookings yet. Projections will appear once you have booking and revenue data.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
