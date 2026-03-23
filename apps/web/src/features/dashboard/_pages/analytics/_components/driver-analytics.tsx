import { Badge } from "@workspace/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import {
	Award,
	Clock,
	DollarSign,
	Star,
	TrendingUp,
	Users,
} from "lucide-react";

interface DriverAnalyticsProps {
	dateRange: string;
	analytics?: {
		totalDrivers: number;
		activeDrivers: number;
		pendingDrivers: number;
	};
}

export function DriverAnalytics({
	dateRange,
	analytics,
}: DriverAnalyticsProps) {
	const driverData = {
		totalDrivers: analytics?.totalDrivers ?? 18,
		activeDrivers: analytics?.activeDrivers ?? 15,
		utilizationRate:
			analytics?.totalDrivers && analytics.totalDrivers > 0
				? Math.round(
						((analytics.activeDrivers ?? 0) / analytics.totalDrivers) * 100,
					)
				: 83.3,
		averageRating: 4.6,
		topPerformers: [
			{
				id: "DRV001",
				name: "Michael Johnson",
				rating: 4.9,
				trips: 45,
				revenue: 3200,
				efficiency: 96,
			},
			{
				id: "DRV002",
				name: "Sarah Wilson",
				rating: 4.8,
				trips: 42,
				revenue: 2950,
				efficiency: 94,
			},
			{
				id: "DRV003",
				name: "James Brown",
				rating: 4.7,
				trips: 38,
				revenue: 2750,
				efficiency: 91,
			},
		],
		performanceMetrics: {
			onTimePerformance: 94.2,
			customerSatisfaction: 4.6,
			averageResponseTime: 3.2,
			cancellationRate: 2.1,
		},
		workingPatterns: {
			peakHours: ["07:00-09:00", "17:00-20:00"],
			averageHoursPerDay: 8.5,
			weekendUtilization: 76,
			weekdayUtilization: 88,
		},
	};

	return (
		<div className="grid gap-4">
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<Users className="h-4 w-4 text-blue-600" />
							Active Drivers
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{driverData.activeDrivers}</div>
						<div className="text-muted-foreground text-xs">
							of {driverData.totalDrivers} total
						</div>
						<Progress
							value={(driverData.activeDrivers / driverData.totalDrivers) * 100}
							className="mt-2 h-1"
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<TrendingUp className="h-4 w-4 text-green-600" />
							Utilization Rate
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{driverData.utilizationRate}%
						</div>
						<div className="text-muted-foreground text-xs">
							Driver efficiency
						</div>
						<Progress value={driverData.utilizationRate} className="mt-2 h-1" />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<Star className="h-4 w-4 text-yellow-600" />
							Average Rating
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{driverData.averageRating}</div>
						<div className="text-muted-foreground text-xs">Customer rating</div>
						<Progress
							value={driverData.averageRating * 20}
							className="mt-2 h-1"
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<Clock className="h-4 w-4 text-purple-600" />
							Response Time
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{driverData.performanceMetrics.averageResponseTime} min
						</div>
						<div className="text-muted-foreground text-xs">
							Average pickup time
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Award className="h-5 w-5 text-gold-600" />
							Top Performing Drivers
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{driverData.topPerformers.map((driver, index) => (
								<div key={driver.id} className="rounded-lg border bg-card p-3">
									<div className="mb-2 flex items-start justify-between">
										<div>
											<p className="font-medium text-sm">{driver.name}</p>
											<p className="text-muted-foreground text-xs">
												ID: {driver.id}
											</p>
										</div>
										<Badge
											variant="outline"
											className="bg-gold-50 text-gold-700"
										>
											#{index + 1}
										</Badge>
									</div>

									<div className="grid grid-cols-3 gap-2 text-xs">
										<div>
											<span className="font-medium">Rating:</span>
											<div className="flex items-center gap-1">
												<Star className="h-3 w-3 fill-current text-yellow-500" />
												<span>{driver.rating}</span>
											</div>
										</div>
										<div>
											<span className="font-medium">Trips:</span>
											<div>{driver.trips}</div>
										</div>
										<div>
											<span className="font-medium">Revenue:</span>
											<div>${driver.revenue}</div>
										</div>
									</div>

									<div className="mt-2">
										<div className="mb-1 flex justify-between text-xs">
											<span>Efficiency</span>
											<span>{driver.efficiency}%</span>
										</div>
										<Progress value={driver.efficiency} className="h-1" />
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-green-600" />
							Performance Metrics
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="font-medium text-sm">On-Time Performance</span>
								<span className="font-bold text-green-600 text-sm">
									{driverData.performanceMetrics.onTimePerformance}%
								</span>
							</div>
							<Progress
								value={driverData.performanceMetrics.onTimePerformance}
								className="h-2"
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Drivers arriving within 5 minutes of scheduled time
							</p>
						</div>

						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="font-medium text-sm">
									Customer Satisfaction
								</span>
								<span className="font-bold text-blue-600 text-sm">
									{driverData.performanceMetrics.customerSatisfaction}/5.0
								</span>
							</div>
							<Progress
								value={driverData.performanceMetrics.customerSatisfaction * 20}
								className="h-2"
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Average rating across all completed trips
							</p>
						</div>

						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="font-medium text-sm">Cancellation Rate</span>
								<span className="font-bold text-orange-600 text-sm">
									{driverData.performanceMetrics.cancellationRate}%
								</span>
							</div>
							<Progress
								value={driverData.performanceMetrics.cancellationRate}
								className="h-2"
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Driver-initiated cancellations
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-purple-600" />
						Working Patterns & Utilization
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-4">
							<div>
								<p className="mb-2 font-medium text-sm">Peak Working Hours</p>
								<div className="flex gap-1">
									{driverData.workingPatterns.peakHours.map((hour, index) => (
										<Badge key={index} variant="secondary">
											{hour}
										</Badge>
									))}
								</div>
							</div>

							<div>
								<div className="mb-1 flex items-center justify-between">
									<span className="font-medium text-sm">
										Average Hours per Day
									</span>
									<span className="font-bold text-sm">
										{driverData.workingPatterns.averageHoursPerDay}h
									</span>
								</div>
								<Progress
									value={
										(driverData.workingPatterns.averageHoursPerDay / 12) * 100
									}
									className="h-2"
								/>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<div className="mb-1 flex items-center justify-between">
									<span className="font-medium text-sm">
										Weekday Utilization
									</span>
									<span className="font-bold text-green-600 text-sm">
										{driverData.workingPatterns.weekdayUtilization}%
									</span>
								</div>
								<Progress
									value={driverData.workingPatterns.weekdayUtilization}
									className="h-2"
								/>
							</div>

							<div>
								<div className="mb-1 flex items-center justify-between">
									<span className="font-medium text-sm">
										Weekend Utilization
									</span>
									<span className="font-bold text-blue-600 text-sm">
										{driverData.workingPatterns.weekendUtilization}%
									</span>
								</div>
								<Progress
									value={driverData.workingPatterns.weekendUtilization}
									className="h-2"
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
