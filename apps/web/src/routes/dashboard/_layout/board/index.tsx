import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import {
	Package,
	Car,
	Users,
	Calendar,
	DollarSign,
	TrendingUp,
	Activity,
	Clock,
	Star,
	MapPin,
	CheckCircle,
	AlertCircle,
	Settings,
	BarChart3,
	PieChart
} from "lucide-react";

export const Route = createFileRoute('/dashboard/_layout/board/')({
	component: AdminDashboard,
});

function AdminDashboard() {
	// Mock data for demo purposes
	const stats = {
		totalBookings: 156,
		activeBookings: 8,
		totalRevenue: 15678,
		monthlyRevenue: 4230,
		totalPackages: 12,
		activePackages: 9,
		totalDrivers: 24,
		activeDrivers: 18,
		avgRating: 4.8,
		completionRate: 96
	};

	// Analytics card data for admin dashboard
	const adminAnalyticsData: AnalyticsCardData[] = [
		{
			id: 'bookings',
			title: 'Bookings',
			value: stats.totalBookings,
			icon: Calendar,
			bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
			iconBg: 'bg-blue-500',
			changeText: `+${stats.activeBookings} active`,
			changeType: 'positive',
			showTrend: true,
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'revenue',
			title: 'Revenue',
			value: `$${(stats.totalRevenue / 1000).toFixed(1)}k`,
			icon: DollarSign,
			bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
			iconBg: 'bg-green-500',
			changeText: `+$${(stats.monthlyRevenue / 1000).toFixed(1)}k month`,
			changeType: 'positive',
			showTrend: true,
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'packages',
			title: 'Packages',
			value: stats.totalPackages,
			icon: Package,
			bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
			iconBg: 'bg-purple-500',
			changeText: `${stats.activePackages} active`,
			changeType: 'neutral',
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'drivers',
			title: 'Drivers',
			value: stats.totalDrivers,
			icon: Users,
			bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
			iconBg: 'bg-orange-500',
			changeText: `${stats.activeDrivers} active`,
			changeType: 'positive',
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true
		}
	];

	const recentActivity = [
		{
			id: 1,
			type: 'booking',
			title: 'Lorem ipsum dolor sit amet',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			time: '5 min ago',
			status: 'pending',
			amount: 125.50
		},
		{
			id: 2,
			type: 'driver',
			title: 'Lorem ipsum dolor sit amet',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			time: '12 min ago',
			status: 'completed',
			amount: 89.00
		},
		{
			id: 3,
			type: 'booking',
			title: 'Lorem ipsum dolor sit amet',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			time: '25 min ago',
			status: 'confirmed',
			amount: 245.00
		}
	];

	return (
		<div className="space-y-4 sm:space-y-6 p-4">
			{/* Welcome Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
						Admin Dashboard
					</h1>
					<p className="text-sm sm:text-base text-muted-foreground">
						Monitor and manage your luxury chauffeur service
					</p>
				</div>
			</div>

			{/* Key Metrics - Mobile First Grid */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
				{adminAnalyticsData.map((data) => (
					<AnalyticsCard
						key={data.id}
						data={data}
						view="compact"
						className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
					/>
				))}
			</div>

			{/* Performance Overview - Mobile Optimized */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
				{/* Rating Card */}
				<Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
					<CardHeader className="p-0 pb-3">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-100 flex items-center justify-center">
								<Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
							</div>
							<div>
								<CardTitle className="text-base sm:text-lg">Service Rating</CardTitle>
								<CardDescription className="text-sm">Customer satisfaction</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-2xl sm:text-3xl font-bold text-foreground">{stats.avgRating}</span>
							<div className="flex items-center">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className={`h-4 w-4 ${i < Math.floor(stats.avgRating) ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`}
									/>
								))}
							</div>
						</div>
						<p className="text-xs text-muted-foreground">Based on 247 reviews</p>
					</CardContent>
				</Card>

				{/* Completion Rate */}
				<Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
					<CardHeader className="p-0 pb-3">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
								<CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
							</div>
							<div>
								<CardTitle className="text-base sm:text-lg">Completion Rate</CardTitle>
								<CardDescription className="text-sm">Trip success rate</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-2xl sm:text-3xl font-bold text-foreground">{stats.completionRate}%</span>
							<TrendingUp className="h-4 w-4 text-green-600" />
						</div>
						<p className="text-xs text-muted-foreground">+2.3% from last month</p>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
					<CardHeader className="p-0 pb-3">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
								<Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
							</div>
							<div>
								<CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
								<CardDescription className="text-sm">Management tools</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="grid grid-cols-2 gap-2">
							<Button variant="outline" size="sm" className="h-8 text-xs" asChild>
								<a href="/dashboard/packages">
									<Package className="h-3 w-3 mr-1" />
									Packages
								</a>
							</Button>
							<Button variant="outline" size="sm" className="h-8 text-xs" asChild>
								<a href="/dashboard/drivers">
									<Users className="h-3 w-3 mr-1" />
									Drivers
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity */}
			<Card className="hover:shadow-md transition-shadow">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
								<Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg sm:text-xl font-bold">Recent Activity</CardTitle>
								<CardDescription className="text-sm hidden sm:block">Latest system events and updates</CardDescription>
							</div>
						</div>
						{/* <Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild> */}
						{/* 	<a href="/dashboard/analytics">View Reports</a> */}
						{/* </Button> */}
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-3 sm:space-y-4">
						{recentActivity.map((activity) => (
							<div key={activity.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/30 transition-all duration-200 hover:shadow-sm">
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'booking' ? 'bg-blue-100' :
										activity.type === 'driver' ? 'bg-green-100' : 'bg-muted'
										}`}>
										{activity.type === 'booking' ? (
											<Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
										) : (
											<Car className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1 flex-wrap">
											<h4 className="font-medium text-foreground text-sm sm:text-base truncate">{activity.title}</h4>
											<Badge
												variant={activity.status === 'completed' ? 'default' : 'secondary'}
												className={`text-xs px-2 py-0.5 ${activity.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
													activity.status === 'confirmed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
														activity.status === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-200' :
															'bg-muted text-muted-foreground'
													}`}
											>
												{activity.status}
											</Badge>
										</div>
										<p className="text-xs sm:text-sm text-muted-foreground truncate">{activity.description}</p>
										<div className="flex items-center gap-1 mt-1">
											<Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
											<span className="text-xs text-muted-foreground">{activity.time}</span>
										</div>
									</div>
								</div>
								<div className="text-right flex-shrink-0">
									<div className="font-semibold text-foreground text-sm sm:text-base">
										${activity.amount.toFixed(2)}
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
