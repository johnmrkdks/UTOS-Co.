import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { useGetDashboardAnalyticsEnhancedQuery } from "@/features/dashboard/_hooks/query/use-get-dashboard-analytics-enhanced-query";
import { DollarSign, TrendingUp } from "lucide-react";

type LastDaysPerformanceCardProps = React.ComponentProps<"div">;

export function LastDaysPerformanceCard({
	className,
	...props
}: LastDaysPerformanceCardProps) {
	const { data: analyticsData, isLoading, error } = useGetDashboardAnalyticsEnhancedQuery();

	const revenue = (analyticsData?.monthlyRevenue ?? 0) / 100;
	const revenueGrowth = analyticsData?.revenueGrowth?.growth ?? 0;
	const completionRate = analyticsData?.completionRate ?? 0;

	if (isLoading) {
		return (
			<Card className={cn("shadow-none", className)} {...props}>
				<CardHeader>
					<CardTitle>This Month</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="h-12 bg-muted animate-pulse rounded" />
						<div className="h-12 bg-muted animate-pulse rounded" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className={cn("shadow-none", className)} {...props}>
				<CardHeader>
					<CardTitle>This Month</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-destructive">Failed to load</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={cn("shadow-none", className)} {...props}>
			<CardHeader>
				<CardTitle>This Month</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<div className="flex items-center gap-2 text-2xl font-bold">
						<DollarSign className="h-5 w-5 text-muted-foreground" />
						${revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						{revenueGrowth >= 0 ? "+" : ""}
						{revenueGrowth}% vs last month
					</p>
				</div>
				<div>
					<div className="flex items-center gap-2 text-2xl font-bold">
						<TrendingUp className="h-5 w-5 text-muted-foreground" />
						{completionRate}%
					</div>
					<p className="text-xs text-muted-foreground mt-1">Completion rate</p>
				</div>
			</CardContent>
		</Card>
	);
}
