import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";

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

export function RevenueAnalytics({ dateRange, analytics }: RevenueAnalyticsProps) {
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
			custom: { amount: customRev, percentage: customPct, bookings: revenueByType.custom.count },
			package: { amount: packageRev, percentage: packagePct, bookings: revenueByType.package.count },
			offload: { amount: offloadRev, percentage: offloadPct, bookings: revenueByType.offload.count },
		},
	};

	const growthPercentage = revenueData.previousPeriodRevenue > 0
		? ((revenueData.totalRevenue - revenueData.previousPeriodRevenue) / revenueData.previousPeriodRevenue) * 100
		: revenueData.totalRevenue > 0 ? 100 : 0;
	const isPositiveGrowth = growthPercentage > 0;

	return (
		<div className="grid gap-4">
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="h-5 w-5 text-green-600" />
							Revenue Growth
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold mb-2">
							${revenueData.totalRevenue.toLocaleString()}
						</div>
						<div className="flex items-center gap-2">
							{isPositiveGrowth ? (
								<TrendingUp className="h-4 w-4 text-green-500" />
							) : (
								<TrendingDown className="h-4 w-4 text-red-500" />
							)}
							<span className={`text-sm font-medium ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
								{isPositiveGrowth ? '+' : ''}{growthPercentage.toFixed(1)}% from previous period
							</span>
						</div>
						<div className="mt-4 space-y-3">
							<div>
								<div className="flex justify-between text-sm mb-1">
									<span>Current Period</span>
									<span>${revenueData.totalRevenue.toLocaleString()}</span>
								</div>
								<Progress value={100} className="h-2" />
							</div>
							<div>
								<div className="flex justify-between text-sm mb-1">
									<span>Previous Period</span>
									<span>${revenueData.previousPeriodRevenue.toLocaleString()}</span>
								</div>
								<Progress 
									value={revenueData.totalRevenue > 0 ? (revenueData.previousPeriodRevenue / revenueData.totalRevenue) * 100 : 0} 
									className="h-2 opacity-60" 
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package className="h-5 w-5 text-blue-600" />
							Revenue by Booking Type
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium">Custom Bookings</span>
								<div className="flex items-center gap-2">
									<Badge variant="outline">{revenueData.revenueByType.custom.bookings} bookings</Badge>
									<span className="text-sm font-bold">${revenueData.revenueByType.custom.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
								</div>
							</div>
							<Progress value={revenueData.revenueByType.custom.percentage} className="h-2" />
							<p className="text-xs text-muted-foreground mt-1">
								{revenueData.revenueByType.custom.percentage.toFixed(1)}% of total revenue
							</p>
						</div>
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium">Package Bookings</span>
								<div className="flex items-center gap-2">
									<Badge variant="outline">{revenueData.revenueByType.package.bookings} bookings</Badge>
									<span className="text-sm font-bold">${revenueData.revenueByType.package.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
								</div>
							</div>
							<Progress value={revenueData.revenueByType.package.percentage} className="h-2" />
							<p className="text-xs text-muted-foreground mt-1">
								{revenueData.revenueByType.package.percentage.toFixed(1)}% of total revenue
							</p>
						</div>
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium">Offload Bookings</span>
								<div className="flex items-center gap-2">
									<Badge variant="outline">{revenueData.revenueByType.offload.bookings} bookings</Badge>
									<span className="text-sm font-bold">${revenueData.revenueByType.offload.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
								</div>
							</div>
							<Progress value={revenueData.revenueByType.offload.percentage} className="h-2" />
							<p className="text-xs text-muted-foreground mt-1">
								{revenueData.revenueByType.offload.percentage.toFixed(1)}% of total revenue
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{totalRev > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="h-5 w-5 text-green-600" />
							Revenue Summary
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-3 gap-4 text-center">
							<div>
								<p className="text-2xl font-bold">${revenueData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
								<p className="text-xs text-muted-foreground">Total Revenue</p>
							</div>
							<div>
								<p className="text-2xl font-bold">
									{revenueData.revenueByType.custom.bookings + revenueData.revenueByType.package.bookings + revenueData.revenueByType.offload.bookings}
								</p>
								<p className="text-xs text-muted-foreground">Total Bookings</p>
							</div>
							<div>
								<p className="text-2xl font-bold">
									${(totalRev / Math.max(1, revenueData.revenueByType.custom.bookings + revenueData.revenueByType.package.bookings + revenueData.revenueByType.offload.bookings)).toFixed(2)}
								</p>
								<p className="text-xs text-muted-foreground">Avg per Booking</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}