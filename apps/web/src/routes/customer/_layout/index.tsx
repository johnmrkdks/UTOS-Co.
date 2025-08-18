import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import { Car, Calendar, Star, Package, Clock, TrendingUp, Activity } from "lucide-react";

export const Route = createFileRoute("/customer/_layout/")({
	component: CustomerDashboard,
});

function CustomerDashboard() {
	// Analytics card data for customer stats
	const customerStatsData: AnalyticsCardData[] = [
		{
			id: 'active-bookings',
			title: 'Active',
			value: 0,
			icon: Clock,
			bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
			iconBg: 'bg-orange-500',
			changeText: 'Bookings',
			changeType: 'neutral',
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'upcoming-trips',
			title: 'Upcoming',
			value: 0,
			icon: Calendar,
			bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
			iconBg: 'bg-blue-500',
			changeText: 'Trips',
			changeType: 'neutral',
			showTrend: false,
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'total-trips',
			title: 'Total Trips',
			value: 0,
			icon: Car,
			bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
			iconBg: 'bg-green-500',
			changeText: 'Completed',
			changeType: 'positive',
			showTrend: true,
			showIcon: true,
			showBackgroundIcon: true
		}
	];

	// Mobile travel summary data
	const travelSummaryData = {
		total: 0,
		rating: 5.0,
		spent: 0
	};

	return (
		<div className="space-y-6 md:space-y-8">
			{/* Welcome Section */}
			<div className="space-y-2 text-center md:text-left">
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back!</h1>
				<p className="text-muted-foreground text-sm md:text-base">
					Manage your luxury travel bookings and discover our premium packages.
				</p>
			</div>

			{/* Quick Stats - Mobile Optimized */}
			<div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
				{/* First two analytics cards */}
				{customerStatsData.slice(0, 2).map((data) => (
					<AnalyticsCard 
						key={data.id} 
						data={data} 
						view="default" 
						className="p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow touch-manipulation" 
					/>
				))}

				{/* Total Trips Card - Hidden on mobile, spans full width on larger screens */}
				<div className="hidden lg:block col-span-2 lg:col-span-1">
					<AnalyticsCard 
						data={customerStatsData[2]} 
						view="default" 
						className="p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow touch-manipulation" 
					/>
				</div>

				{/* Mobile-specific Additional Stats */}
				<Card className="lg:hidden col-span-2 p-3 sm:p-4 hover:shadow-md transition-shadow touch-manipulation">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-0">
						<CardTitle className="text-sm font-medium text-foreground">
							Travel Summary
						</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent className="p-0">
						<div className="grid grid-cols-3 gap-3 text-center">
							<div>
								<div className="text-lg font-bold text-foreground">{travelSummaryData.total}</div>
								<p className="text-xs text-muted-foreground">Total</p>
							</div>
							<div>
								<div className="text-lg font-bold text-green-600">{travelSummaryData.rating}</div>
								<p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
									<Star className="h-2 w-2 fill-current" />
									Rating
								</p>
							</div>
							<div>
								<div className="text-lg font-bold text-blue-600">${travelSummaryData.spent}</div>
								<p className="text-xs text-muted-foreground">Spent</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions - Mobile-First Design */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
				{/* Browse Services Card */}
				<Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
					<CardHeader className="pb-3">
						<div className="flex items-start space-x-3">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
								<Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
							</div>
							<div className="flex-1 min-w-0">
								<CardTitle className="text-lg sm:text-xl font-bold text-foreground leading-tight">
									Luxury Services
								</CardTitle>
								<CardDescription className="text-sm text-muted-foreground mt-1 leading-relaxed">
									Premium experiences
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
								Airport transfers, city tours, wine country experiences, and event transportation.
							</p>
							<Button className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium group-hover:bg-primary/90 transition-colors" asChild>
								<a href="/customer/services">
									<Package className="h-4 w-4 mr-2" />
									Browse Services
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Custom Quote Card */}
				<Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
					<CardHeader className="pb-3">
						<div className="flex items-start space-x-3">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
								<Car className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
							</div>
							<div className="flex-1 min-w-0">
								<CardTitle className="text-lg sm:text-xl font-bold text-foreground leading-tight">
									Custom Quote
								</CardTitle>
								<CardDescription className="text-sm text-muted-foreground mt-1 leading-relaxed">
									Flexible bookings
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
								Custom routes, multiple stops, flexible timing, and personalized requirements.
							</p>
							<Button className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium" variant="outline" asChild>
								<a href="/customer/instant-quote">
									<Car className="h-4 w-4 mr-2" />
									Get Quote
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity - Mobile Optimized */}
			<Card className="hover:shadow-md transition-shadow">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
								<div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center">
									<Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
								</div>
								Recent Activity
							</CardTitle>
							<CardDescription className="text-sm text-muted-foreground mt-1">
								Your latest bookings and status
							</CardDescription>
						</div>
						<Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild>
							<a href="/customer/bookings">View All</a>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
						<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4 sm:mb-6">
							<Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
						</div>
						<h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">No bookings yet</h3>
						<p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8 max-w-sm leading-relaxed px-4">
							Start your luxury travel journey by booking your first service.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
							<Button className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-medium" asChild>
								<a href="/customer/services">
									<Package className="h-4 w-4 mr-2" />
									Book Service
								</a>
							</Button>
							<Button variant="outline" className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-medium" asChild>
								<a href="/customer/instant-quote">
									<Car className="h-4 w-4 mr-2" />
									Get Quote
								</a>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}