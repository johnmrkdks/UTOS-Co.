import { Badge } from "@workspace/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import {
	Calendar,
	Clock,
	DollarSign,
	MapPin,
	Package2,
	Star,
	TrendingUp,
	Users,
} from "lucide-react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { useGetDashboardAnalyticsEnhancedQuery } from "@/features/dashboard/_hooks/query/use-get-dashboard-analytics-enhanced-query";

export function PackageAnalyticsDashboard() {
	const { data: analytics } = useGetDashboardAnalyticsEnhancedQuery();

	const overview = {
		totalPackages: analytics?.totalPackages ?? 0,
		activePackages: analytics?.activePackages ?? 0,
		publishedPackages: analytics?.publishedPackages ?? 0,
		totalBookings: analytics?.totalBookings ?? 0,
		totalRevenue: (analytics?.totalRevenue ?? 0) / 100,
		averageRating: analytics?.reviews?.averageRating ?? 0,
		conversionRate:
			analytics?.totalBookings && analytics?.totalPackages
				? Math.round(
						(analytics.totalBookings /
							Math.max(1, analytics.totalPackages * 10)) *
							100,
					)
				: 0,
	};

	const totalByType =
		(analytics?.revenueByType?.package?.count ?? 0) +
		(analytics?.revenueByType?.custom?.count ?? 0) +
		(analytics?.revenueByType?.offload?.count ?? 0);
	const packageTypeDistribution =
		analytics?.revenueByType && totalByType > 0
			? [
					{
						name: "Package",
						value: analytics.revenueByType.package.count,
						pct: Math.round(
							(analytics.revenueByType.package.count / totalByType) * 100,
						),
						color: "#8884d8",
					},
					{
						name: "Custom",
						value: analytics.revenueByType.custom.count,
						pct: Math.round(
							(analytics.revenueByType.custom.count / totalByType) * 100,
						),
						color: "#82ca9d",
					},
					{
						name: "Offload",
						value: analytics.revenueByType.offload.count,
						pct: Math.round(
							(analytics.revenueByType.offload.count / totalByType) * 100,
						),
						color: "#ffc658",
					},
				].filter((d) => d.value > 0)
			: [];

	const bookingTrends = analytics?.revenueGrowth
		? [
				{
					month: "This Month",
					bookings: analytics.bookingGrowth?.thisMonth ?? 0,
					revenue: (analytics.revenueGrowth.thisMonth ?? 0) / 100,
				},
				{
					month: "Last Month",
					bookings: analytics.bookingGrowth?.lastMonth ?? 0,
					revenue: (analytics.revenueGrowth.lastMonth ?? 0) / 100,
				},
			]
		: [];

	const topPerformingPackages = [];

	return (
		<div className="space-y-4">
			{/* Compact Overview Stats */}
			<div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
				<Card className="border-0 bg-muted/30">
					<CardContent className="p-3">
						<div className="flex items-center gap-2">
							<Package2 className="h-3 w-3 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="truncate text-muted-foreground text-xs">
									Total Packages
								</p>
								<p className="font-medium text-sm">{overview.totalPackages}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-muted/30">
					<CardContent className="p-3">
						<div className="flex items-center gap-2">
							<Calendar className="h-3 w-3 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="truncate text-muted-foreground text-xs">
									Active Packages
								</p>
								<p className="font-medium text-sm">{overview.activePackages}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-muted/30">
					<CardContent className="p-3">
						<div className="flex items-center gap-2">
							<DollarSign className="h-3 w-3 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="truncate text-muted-foreground text-xs">
									Revenue
								</p>
								<p className="font-medium text-sm">
									${(overview.totalRevenue / 1000).toFixed(0)}k
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-muted/30">
					<CardContent className="p-3">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-3 w-3 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="truncate text-muted-foreground text-xs">
									Conversion
								</p>
								<p className="font-medium text-sm">
									{overview.conversionRate}%
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{/* Booking Trends */}
				<Card>
					<CardHeader>
						<CardTitle>Booking Trends</CardTitle>
						<CardDescription>
							Monthly booking and revenue performance
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[200px]">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={bookingTrends}>
									<defs>
										<linearGradient
											id="colorBookings"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
										</linearGradient>
										<linearGradient
											id="colorRevenue"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="month" />
									<YAxis yAxisId="left" />
									<YAxis yAxisId="right" orientation="right" />
									<Tooltip />
									<Area
										yAxisId="left"
										type="monotone"
										dataKey="bookings"
										stroke="#8884d8"
										fillOpacity={1}
										fill="url(#colorBookings)"
										name="Bookings"
									/>
									<Area
										yAxisId="right"
										type="monotone"
										dataKey="revenue"
										stroke="#82ca9d"
										fillOpacity={1}
										fill="url(#colorRevenue)"
										name="Revenue ($)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* Package Type Distribution */}
				<Card>
					<CardHeader>
						<CardTitle>Package Types</CardTitle>
						<CardDescription>Distribution by service type</CardDescription>
					</CardHeader>
					<CardContent>
						{packageTypeDistribution.length > 0 ? (
							<div className="h-[200px]">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={packageTypeDistribution}
											cx="50%"
											cy="50%"
											innerRadius={60}
											outerRadius={80}
											fill="#8884d8"
											paddingAngle={5}
											dataKey="value"
										>
											{packageTypeDistribution.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</div>
						) : (
							<p className="py-8 text-center text-muted-foreground text-sm">
								No booking data yet.
							</p>
						)}
						<div className="mt-4 grid grid-cols-2 gap-4">
							{packageTypeDistribution.map((item, index) => (
								<div key={index} className="flex items-center gap-2">
									<div
										className="h-3 w-3 rounded-full"
										style={{ backgroundColor: item.color }}
									/>
									<span className="text-sm">{item.name}</span>
									<span className="ml-auto font-medium text-sm">
										{item.pct ?? item.value}%
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Top Performing Packages */}
			<Card>
				<CardHeader>
					<CardTitle>Top Performing Packages</CardTitle>
					<CardDescription>
						Packages ranked by bookings and revenue performance
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{topPerformingPackages.length === 0 ? (
							<p className="py-4 text-muted-foreground text-sm">
								Package-level performance data will appear here as bookings
								grow.
							</p>
						) : (
							topPerformingPackages.map((pkg, index) => (
								<div
									key={pkg.id}
									className="flex items-center space-x-4 rounded-lg border p-4"
								>
									<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
										{index + 1}
									</div>

									<div className="min-w-0 flex-1">
										<div className="mb-2 flex items-center justify-between">
											<h4 className="truncate font-medium">{pkg.name}</h4>
											<Badge variant="secondary" className="ml-2">
												<Star className="mr-1 h-3 w-3" />
												{pkg.rating}
											</Badge>
										</div>

										<div className="grid grid-cols-3 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">Bookings:</span>
												<div className="font-medium">{pkg.bookings}</div>
											</div>
											<div>
												<span className="text-muted-foreground">Revenue:</span>
												<div className="font-medium">
													${pkg.revenue.toLocaleString()}
												</div>
											</div>
											<div>
												<span className="text-muted-foreground">
													Conversion:
												</span>
												<div className="font-medium">{pkg.conversionRate}%</div>
											</div>
										</div>

										<div className="mt-2">
											<div className="mb-1 flex items-center justify-between text-muted-foreground text-xs">
												<span>Conversion Rate</span>
												<span>{pkg.conversionRate}%</span>
											</div>
											<Progress value={pkg.conversionRate} className="h-2" />
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>

			{/* Key Insights */}
			<Card>
				<CardHeader>
					<CardTitle>Key Insights</CardTitle>
					<CardDescription>
						Actionable insights from your package performance
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-3">
							<h4 className="flex items-center gap-2 font-medium">
								<TrendingUp className="h-4 w-4 text-green-600" />
								Top Opportunities
							</h4>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start gap-2">
									<div className="mt-2 h-2 w-2 rounded-full bg-green-600" />
									<span>
										"Blue Mountains Day Tour" has the highest conversion rate
										(45%) - consider promoting similar tour packages
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="mt-2 h-2 w-2 rounded-full bg-green-600" />
									<span>
										Wedding packages show strong performance - expand wedding
										service offerings
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="mt-2 h-2 w-2 rounded-full bg-green-600" />
									<span>
										Transfer services dominate bookings (45%) - optimize pricing
										for higher margins
									</span>
								</li>
							</ul>
						</div>

						<div className="space-y-3">
							<h4 className="flex items-center gap-2 font-medium">
								<Clock className="h-4 w-4 text-orange-600" />
								Areas for Improvement
							</h4>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start gap-2">
									<div className="mt-2 h-2 w-2 rounded-full bg-orange-600" />
									<span>
										Hourly packages have low adoption (10%) - review pricing and
										marketing strategy
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="mt-2 h-2 w-2 rounded-full bg-orange-600" />
									<span>
										Overall conversion rate (23.5%) has room for improvement -
										optimize package descriptions
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="mt-2 h-2 w-2 rounded-full bg-orange-600" />
									<span>
										6 packages are unpublished - review and publish suitable
										packages to increase inventory
									</span>
								</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
