import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { DollarSign, TrendingUp } from "lucide-react";
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
			<Card className={cn("shadow-none", className)} {...props}>
				<CardHeader>
					<CardTitle>This Month</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="h-12 animate-pulse rounded bg-muted" />
						<div className="h-12 animate-pulse rounded bg-muted" />
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
					<p className="text-destructive text-sm">Failed to load</p>
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
					<div className="flex items-center gap-2 font-bold text-2xl">
						<DollarSign className="h-5 w-5 text-muted-foreground" />$
						{revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
					</div>
					<p className="mt-1 text-muted-foreground text-xs">
						{revenueGrowth >= 0 ? "+" : ""}
						{revenueGrowth}% vs last month
					</p>
				</div>
				<div>
					<div className="flex items-center gap-2 font-bold text-2xl">
						<TrendingUp className="h-5 w-5 text-muted-foreground" />
						{completionRate}%
					</div>
					<p className="mt-1 text-muted-foreground text-xs">Completion rate</p>
				</div>
			</CardContent>
		</Card>
	);
}
