import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import { useGetDashboardAnalyticsEnhancedQuery, formatDashboardAnalytics } from '@/features/dashboard/_hooks/query/use-get-dashboard-analytics-enhanced-query';
import { useGetCarsQuery } from '@/features/dashboard/_pages/car-management/_hooks/query/car/use-get-cars-query';
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
	PieChart,
	Loader2
} from "lucide-react";

export const Route = createFileRoute('/admin/dashboard/_layout/board/')({
	component: AdminDashboard,
});

function AdminDashboard() {
	const { data: analyticsData, isLoading, error } = useGetDashboardAnalyticsEnhancedQuery();
	const { data: carsData, isLoading: carsLoading } = useGetCarsQuery({ limit: 1000 }); // Get all cars for count
	const data = formatDashboardAnalytics(analyticsData);

	if (isLoading || carsLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="flex items-center gap-2">
					<Loader2 className="h-6 w-6 animate-spin" />
					<span className="text-muted-foreground">Loading dashboard data...</span>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-2">
					<AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
					<p className="text-muted-foreground">Failed to load dashboard data</p>
					<Button variant="outline" size="sm" onClick={() => window.location.reload()}>
						Retry
					</Button>
				</div>
			</div>
		)
	}

	const stats = data?.stats || {
		totalBookings: 0,
		activeBookings: 0,
		totalRevenue: 0,
		monthlyRevenue: 0,
		totalPackages: 0,
		activePackages: 0,
		totalDrivers: 0,
		activeDrivers: 0,
		avgRating: 0,
		completionRate: 0
	}

	// Calculate vehicle stats
	const totalVehicles = carsData?.data?.length || 0;
	const availableVehicles = carsData?.data?.filter((car: any) => {
		return car.isAvailable === true && car.isActive === true;
	}).length || 0;

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
			id: 'vehicles',
			title: 'Vehicles',
			value: totalVehicles,
			icon: Car,
			bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
			iconBg: 'bg-green-500',
			changeText: `${availableVehicles} available`,
			changeType: 'neutral',
			showTrend: false,
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
	]

	const recentActivity = data?.recentActivity || [];

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
						view='compact'
						className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
					/>
				))}
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
						{/* 	<a href="/admin/dashboard/analytics">View Reports</a> */}
						{/* </Button> */}
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-3 sm:space-y-4">
						{recentActivity.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
								<p>No recent activity</p>
								<p className="text-xs">Activity will appear here when bookings are created</p>
							</div>
						) : (
							recentActivity.map((activity: any) => (
								<div key={activity.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/30 transition-all duration-200 hover:shadow-sm">
									<div className="flex items-center gap-3 flex-1 min-w-0">
										<div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
											activity.type === 'package' || activity.type === 'custom' ? 'bg-blue-100' :
											activity.type === 'driver' ? 'bg-green-100' : 'bg-muted'
										}`}>
											{activity.type === 'package' || activity.type === 'custom' ? (
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
													className={`text-xs px-2 py-0.5 ${
														activity.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
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
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
