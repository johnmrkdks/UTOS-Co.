import {
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { DollarSign, TrendingUp } from "lucide-react";
import { DashboardChartCard } from "@/features/dashboard/_components/dashboard-chart-card";
import { useGetDashboardAnalyticsEnhancedQuery } from "@/features/dashboard/_hooks/query/use-get-dashboard-analytics-enhanced-query";

type LastDaysPerformanceCardProps = React.ComponentProps<"div">;

export function LastDaysPerformanceCard({
	className,
	...props
}: LastDaysPerformanceCardProps) {
	const {
		data: analyticsData,
		isLoading,
		error,
	} = useGetDashboardAnalyticsEnhancedQuery();

	const revenue = (analyticsData?.monthlyRevenue ?? 0) / 100;
	const revenueGrowth = analyticsData?.revenueGrowth?.growth ?? 0;
	const completionRate = analyticsData?.completionRate ?? 0;

	if (isLoading) {
		return (
			<DashboardChartCard className={cn(className)} {...props}>
				<CardHeader>
					<CardTitle>This month</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="h-12 animate-pulse rounded-lg bg-muted" />
						<div className="h-12 animate-pulse rounded-lg bg-muted" />
					</div>
				</CardContent>
			</DashboardChartCard>
		);
	}

	if (error) {
		return (
			<DashboardChartCard className={cn(className)} {...props}>
				<CardHeader>
					<CardTitle>This month</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-destructive text-sm">Failed to load</p>
				</CardContent>
			</DashboardChartCard>
		);
	}

	return (
		<DashboardChartCard className={cn(className)} {...props}>
			<CardHeader>
				<CardTitle>This month</CardTitle>
				<p className="text-muted-foreground text-sm">
					Revenue and completion at a glance
				</p>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="rounded-xl border border-border/50 bg-muted/25 p-4">
					<div className="flex items-center gap-2 font-bold text-2xl tabular-nums">
						<DollarSign className="h-5 w-5 text-muted-foreground" />$
						{revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
					</div>
					<p className="mt-1 text-muted-foreground text-xs">
						{revenueGrowth >= 0 ? "+" : ""}
						{revenueGrowth}% vs last month
					</p>
				</div>
				<div className="rounded-xl border border-border/50 bg-muted/25 p-4">
					<div className="flex items-center gap-2 font-bold text-2xl tabular-nums">
						<TrendingUp className="h-5 w-5 text-muted-foreground" />
						{completionRate}%
					</div>
					<p className="mt-1 text-muted-foreground text-xs">Completion rate</p>
				</div>
			</CardContent>
		</DashboardChartCard>
	);
}
