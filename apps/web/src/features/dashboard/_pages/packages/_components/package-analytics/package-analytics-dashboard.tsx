import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { 
	BarChart, 
	Bar, 
	XAxis, 
	YAxis, 
	CartesianGrid, 
	Tooltip, 
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
	Area,
	AreaChart
} from 'recharts';
import { 
	Package2, 
	TrendingUp, 
	DollarSign, 
	Users, 
	Calendar,
	Star,
	Clock,
	MapPin
} from "lucide-react";

// Mock data - in real implementation, this would come from API
const mockPackageAnalytics = {
	overview: {
		totalPackages: 24,
		activePackages: 18,
		publishedPackages: 15,
		totalBookings: 142,
		totalRevenue: 28450.00,
		averageRating: 4.6,
		conversionRate: 23.5,
	},
	topPerformingPackages: [
		{
			id: "1",
			name: "Sydney Airport Transfer",
			bookings: 45,
			revenue: 6750.00,
			rating: 4.8,
			conversionRate: 32,
		},
		{
			id: "2", 
			name: "Blue Mountains Day Tour",
			bookings: 28,
			revenue: 8400.00,
			rating: 4.9,
			conversionRate: 45,
		},
		{
			id: "3",
			name: "Harbour Bridge Experience",
			bookings: 22,
			revenue: 5280.00,
			rating: 4.5,
			conversionRate: 28,
		},
		{
			id: "4",
			name: "Corporate Event Transfer",
			bookings: 18,
			revenue: 5400.00,
			rating: 4.7,
			conversionRate: 35,
		},
		{
			id: "5",
			name: "Wedding Package Deluxe",
			bookings: 12,
			revenue: 3600.00,
			rating: 4.9,
			conversionRate: 55,
		},
	],
	bookingTrends: [
		{ month: "Jan", bookings: 18, revenue: 4200 },
		{ month: "Feb", bookings: 22, revenue: 5100 },
		{ month: "Mar", bookings: 25, revenue: 6800 },
		{ month: "Apr", bookings: 19, revenue: 4900 },
		{ month: "May", bookings: 28, revenue: 7200 },
		{ month: "Jun", bookings: 30, revenue: 8100 },
	],
	packageTypeDistribution: [
		{ name: "Transfer", value: 45, color: "#8884d8" },
		{ name: "Tour", value: 30, color: "#82ca9d" },
		{ name: "Event", value: 15, color: "#ffc658" },
		{ name: "Hourly", value: 10, color: "#ff7c7c" },
	],
};

export function PackageAnalyticsDashboard() {
	const { overview, topPerformingPackages, bookingTrends, packageTypeDistribution } = mockPackageAnalytics;

	return (
		<div className="space-y-4">
			{/* Compact Overview Stats */}
			<div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
				<Card className="border-0 bg-muted/30">
					<CardContent className="p-3">
						<div className="flex items-center gap-2">
							<Package2 className="h-3 w-3 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="text-xs text-muted-foreground truncate">Total Packages</p>
								<p className="text-sm font-medium">{overview.totalPackages}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-muted/30">
					<CardContent className="p-3">
						<div className="flex items-center gap-2">
							<Calendar className="h-3 w-3 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="text-xs text-muted-foreground truncate">Active Packages</p>
								<p className="text-sm font-medium">{overview.activePackages}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-muted/30">
					<CardContent className="p-3">
						<div className="flex items-center gap-2">
							<DollarSign className="h-3 w-3 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="text-xs text-muted-foreground truncate">Revenue</p>
								<p className="text-sm font-medium">${(overview.totalRevenue / 1000).toFixed(0)}k</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-muted/30">
					<CardContent className="p-3">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-3 w-3 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="text-xs text-muted-foreground truncate">Conversion</p>
								<p className="text-sm font-medium">{overview.conversionRate}%</p>
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
						<CardDescription>Monthly booking and revenue performance</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[200px]">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={bookingTrends}>
									<defs>
										<linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
											<stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
										</linearGradient>
										<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
											<stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
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
						<div className="grid grid-cols-2 gap-4 mt-4">
							{packageTypeDistribution.map((item, index) => (
								<div key={index} className="flex items-center gap-2">
									<div 
										className="w-3 h-3 rounded-full" 
										style={{ backgroundColor: item.color }}
									/>
									<span className="text-sm">{item.name}</span>
									<span className="text-sm font-medium ml-auto">{item.value}%</span>
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
					<CardDescription>Packages ranked by bookings and revenue performance</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{topPerformingPackages.map((pkg, index) => (
							<div key={pkg.id} className="flex items-center space-x-4 p-4 border rounded-lg">
								<div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
									{index + 1}
								</div>
								
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between mb-2">
										<h4 className="font-medium truncate">{pkg.name}</h4>
										<Badge variant="secondary" className="ml-2">
											<Star className="w-3 h-3 mr-1" />
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
											<div className="font-medium">${pkg.revenue.toLocaleString()}</div>
										</div>
										<div>
											<span className="text-muted-foreground">Conversion:</span>
											<div className="font-medium">{pkg.conversionRate}%</div>
										</div>
									</div>
									
									<div className="mt-2">
										<div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
											<span>Conversion Rate</span>
											<span>{pkg.conversionRate}%</span>
										</div>
										<Progress value={pkg.conversionRate} className="h-2" />
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Key Insights */}
			<Card>
				<CardHeader>
					<CardTitle>Key Insights</CardTitle>
					<CardDescription>Actionable insights from your package performance</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-3">
							<h4 className="font-medium flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-green-600" />
								Top Opportunities
							</h4>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start gap-2">
									<div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
									<span>
										"Blue Mountains Day Tour" has the highest conversion rate (45%) - consider promoting similar tour packages
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
									<span>
										Wedding packages show strong performance - expand wedding service offerings
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
									<span>
										Transfer services dominate bookings (45%) - optimize pricing for higher margins
									</span>
								</li>
							</ul>
						</div>
						
						<div className="space-y-3">
							<h4 className="font-medium flex items-center gap-2">
								<Clock className="h-4 w-4 text-orange-600" />
								Areas for Improvement
							</h4>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start gap-2">
									<div className="w-2 h-2 rounded-full bg-orange-600 mt-2" />
									<span>
										Hourly packages have low adoption (10%) - review pricing and marketing strategy
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="w-2 h-2 rounded-full bg-orange-600 mt-2" />
									<span>
										Overall conversion rate (23.5%) has room for improvement - optimize package descriptions
									</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="w-2 h-2 rounded-full bg-orange-600 mt-2" />
									<span>
										6 packages are unpublished - review and publish suitable packages to increase inventory
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