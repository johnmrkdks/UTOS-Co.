import { Badge } from "@workspace/ui/components/badge";
import {
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { DollarSign, Package, TrendingDown, TrendingUp } from "lucide-react";
import { DashboardChartCard } from "@/features/dashboard/_components/dashboard-chart-card";

interface RevenueAnalyticsProps {
	dateRange: string;
	analytics?: {
		totalRevenue: number;
		monthlyRevenue: number;
		revenueGrowth: { thisMonth: number; lastMonth: number; growth: number };
		revenueByType?: {
			package: { revenue: number; count: number };
			custom: { revenue: number; count: number };
			offload: { revenue: number; count: number };
		};
	};
}

export function RevenueAnalytics({
	dateRange,
	analytics,
}: RevenueAnalyticsProps) {
	const totalRev = (analytics?.totalRevenue ?? 0) / 100;
	const prevRev = (analytics?.revenueGrowth?.lastMonth ?? 0) / 100;

	const revenueByType = analytics?.revenueByType ?? {
		package: { revenue: 0, count: 0 },
		custom: { revenue: 0, count: 0 },
		offload: { revenue: 0, count: 0 },
	};

	const packageRev = revenueByType.package.revenue / 100;
	const customRev = revenueByType.custom.revenue / 100;
	const offloadRev = revenueByType.offload.revenue / 100;

	const packagePct = totalRev > 0 ? (packageRev / totalRev) * 100 : 0;
	const customPct = totalRev > 0 ? (customRev / totalRev) * 100 : 0;
	const offloadPct = totalRev > 0 ? (offloadRev / totalRev) * 100 : 0;

	const revenueData = {
		totalRevenue: totalRev,
		previousPeriodRevenue: prevRev,
		revenueByType: {
			custom: {
				amount: customRev,
				percentage: customPct,
				bookings: revenueByType.custom.count,
			},
			package: {
				amount: packageRev,
				percentage: packagePct,
				bookings: revenueByType.package.count,
			},
			offload: {
				amount: offloadRev,
				percentage: offloadPct,
				bookings: revenueByType.offload.count,
			},
		},
	};

	const growthPercentage =
		revenueData.previousPeriodRevenue > 0
			? ((revenueData.totalRevenue - revenueData.previousPeriodRevenue) /
					revenueData.previousPeriodRevenue) *
				100
			: revenueData.totalRevenue > 0
				? 100
				: 0;
	const isPositiveGrowth = growthPercentage > 0;

	return (
		<div className="grid gap-4">
			<div className="grid gap-4 md:grid-cols-2">
				<DashboardChartCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="h-5 w-5 text-green-600" />
							Revenue Growth
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mb-2 font-bold text-3xl">
							${revenueData.totalRevenue.toLocaleString()}
						</div>
						<div className="flex items-center gap-2">
							{isPositiveGrowth ? (
								<TrendingUp className="h-4 w-4 text-green-500" />
							) : (
								<TrendingDown className="h-4 w-4 text-red-500" />
							)}
							<span
								className={`font-medium text-sm ${isPositiveGrowth ? "text-green-600" : "text-red-600"}`}
							>
								{isPositiveGrowth ? "+" : ""}
								{growthPercentage.toFixed(1)}% from previous period
							</span>
						</div>
						<div className="mt-4 space-y-3">
							<div>
								<div className="mb-1 flex justify-between text-sm">
									<span>Current Period</span>
									<span>${revenueData.totalRevenue.toLocaleString()}</span>
								</div>
								<Progress value={100} className="h-2" />
							</div>
							<div>
								<div className="mb-1 flex justify-between text-sm">
									<span>Previous Period</span>
									<span>
										${revenueData.previousPeriodRevenue.toLocaleString()}
									</span>
								</div>
								<Progress
									value={
										revenueData.totalRevenue > 0
											? (revenueData.previousPeriodRevenue /
													revenueData.totalRevenue) *
												100
											: 0
									}
									className="h-2 opacity-60"
								/>
							</div>
						</div>
					</CardContent>
				</DashboardChartCard>

				<DashboardChartCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package className="h-5 w-5 text-blue-600" />
							Revenue by Booking Type
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="font-medium text-sm">Custom Bookings</span>
								<div className="flex items-center gap-2">
									<Badge variant="outline">
										{revenueData.revenueByType.custom.bookings} bookings
									</Badge>
									<span className="font-bold text-sm">
										$
										{revenueData.revenueByType.custom.amount.toLocaleString(
											undefined,
											{ minimumFractionDigits: 2 },
										)}
									</span>
								</div>
							</div>
							<Progress
								value={revenueData.revenueByType.custom.percentage}
								className="h-2"
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								{revenueData.revenueByType.custom.percentage.toFixed(1)}% of
								total revenue
							</p>
						</div>
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="font-medium text-sm">Package Bookings</span>
								<div className="flex items-center gap-2">
									<Badge variant="outline">
										{revenueData.revenueByType.package.bookings} bookings
									</Badge>
									<span className="font-bold text-sm">
										$
										{revenueData.revenueByType.package.amount.toLocaleString(
											undefined,
											{ minimumFractionDigits: 2 },
										)}
									</span>
								</div>
							</div>
							<Progress
								value={revenueData.revenueByType.package.percentage}
								className="h-2"
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								{revenueData.revenueByType.package.percentage.toFixed(1)}% of
								total revenue
							</p>
						</div>
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="font-medium text-sm">Offload Bookings</span>
								<div className="flex items-center gap-2">
									<Badge variant="outline">
										{revenueData.revenueByType.offload.bookings} bookings
									</Badge>
									<span className="font-bold text-sm">
										$
										{revenueData.revenueByType.offload.amount.toLocaleString(
											undefined,
											{ minimumFractionDigits: 2 },
										)}
									</span>
								</div>
							</div>
							<Progress
								value={revenueData.revenueByType.offload.percentage}
								className="h-2"
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								{revenueData.revenueByType.offload.percentage.toFixed(1)}% of
								total revenue
							</p>
						</div>
					</CardContent>
				</DashboardChartCard>
			</div>

			{totalRev > 0 && (
				<DashboardChartCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="h-5 w-5 text-green-600" />
							Revenue Summary
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-3 gap-4 text-center">
							<div>
								<p className="font-bold text-2xl">
									$
									{revenueData.totalRevenue.toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</p>
								<p className="text-muted-foreground text-xs">Total Revenue</p>
							</div>
							<div>
								<p className="font-bold text-2xl">
									{revenueData.revenueByType.custom.bookings +
										revenueData.revenueByType.package.bookings +
										revenueData.revenueByType.offload.bookings}
								</p>
								<p className="text-muted-foreground text-xs">Total Bookings</p>
							</div>
							<div>
								<p className="font-bold text-2xl">
									$
									{(
										totalRev /
										Math.max(
											1,
											revenueData.revenueByType.custom.bookings +
												revenueData.revenueByType.package.bookings +
												revenueData.revenueByType.offload.bookings,
										)
									).toFixed(2)}
								</p>
								<p className="text-muted-foreground text-xs">Avg per Booking</p>
							</div>
						</div>
					</CardContent>
				</DashboardChartCard>
			)}
		</div>
	);
}
