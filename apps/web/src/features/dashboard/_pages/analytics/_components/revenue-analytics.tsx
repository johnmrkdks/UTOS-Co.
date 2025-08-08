import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Package } from "lucide-react";

interface RevenueAnalyticsProps {
	dateRange: string;
}

export function RevenueAnalytics({ dateRange }: RevenueAnalyticsProps) {
	// Mock data - in real implementation, this would come from API
	const revenueData = {
		totalRevenue: 45750,
		previousPeriodRevenue: 40650,
		revenueByType: {
			custom: { amount: 28500, percentage: 62.3, bookings: 198 },
			package: { amount: 17250, percentage: 37.7, bookings: 126 },
		},
		revenueByPaymentMethod: {
			card: { amount: 32025, percentage: 70 },
			payid: { amount: 9150, percentage: 20 },
			applePay: { amount: 4575, percentage: 10 },
		},
		monthlyTrend: [
			{ month: "Jan", revenue: 38200 },
			{ month: "Feb", revenue: 42100 },
			{ month: "Mar", revenue: 45750 },
			{ month: "Apr", revenue: 41300 },
			{ month: "May", revenue: 39800 },
			{ month: "Jun", revenue: 45750 },
		],
		topPerformers: [
			{ driver: "Driver #12", revenue: 4250, bookings: 28 },
			{ driver: "Driver #05", revenue: 3890, bookings: 25 },
			{ driver: "Driver #18", revenue: 3650, bookings: 22 },
		],
	};

	const growthPercentage = ((revenueData.totalRevenue - revenueData.previousPeriodRevenue) / revenueData.previousPeriodRevenue) * 100;
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
									value={(revenueData.previousPeriodRevenue / revenueData.totalRevenue) * 100} 
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
									<span className="text-sm font-bold">${revenueData.revenueByType.custom.amount.toLocaleString()}</span>
								</div>
							</div>
							<Progress value={revenueData.revenueByType.custom.percentage} className="h-2" />
							<p className="text-xs text-muted-foreground mt-1">
								{revenueData.revenueByType.custom.percentage}% of total revenue
							</p>
						</div>
						
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium">Package Bookings</span>
								<div className="flex items-center gap-2">
									<Badge variant="outline">{revenueData.revenueByType.package.bookings} bookings</Badge>
									<span className="text-sm font-bold">${revenueData.revenueByType.package.amount.toLocaleString()}</span>
								</div>
							</div>
							<Progress value={revenueData.revenueByType.package.percentage} className="h-2" />
							<p className="text-xs text-muted-foreground mt-1">
								{revenueData.revenueByType.package.percentage}% of total revenue
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="h-5 w-5 text-purple-600" />
							Payment Methods
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{Object.entries(revenueData.revenueByPaymentMethod).map(([method, data]) => (
							<div key={method}>
								<div className="flex justify-between items-center mb-1">
									<span className="text-sm font-medium capitalize">{method}</span>
									<span className="text-sm font-bold">${data.amount.toLocaleString()}</span>
								</div>
								<Progress value={data.percentage} className="h-2" />
								<p className="text-xs text-muted-foreground mt-1">{data.percentage}% of payments</p>
							</div>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Top Revenue Generators</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{revenueData.topPerformers.map((performer, index) => (
								<div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
									<div>
										<p className="text-sm font-medium">{performer.driver}</p>
										<p className="text-xs text-muted-foreground">{performer.bookings} bookings</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-bold">${performer.revenue.toLocaleString()}</p>
										<Badge variant="outline" className="text-xs">
											#{index + 1}
										</Badge>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}