import { Badge } from "@workspace/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Car, CheckCircle, Clock, MapPin, Users, XCircle } from "lucide-react";

interface BookingPerformanceProps {
	dateRange: string;
	analytics?: {
		totalBookings: number;
		completedBookings: number;
		cancelledBookings: number;
		completionRate: number;
		cancellationRate: number;
	};
}

export function BookingPerformance({
	dateRange,
	analytics,
}: BookingPerformanceProps) {
	const bookingData = analytics
		? {
				totalBookings: analytics.totalBookings,
				completedBookings: analytics.completedBookings,
				cancelledBookings: analytics.cancelledBookings,
				noShowBookings: 0,
				completionRate: analytics.completionRate,
				averageWaitTime: 0,
				averageTripDuration: 0,
				peakHours: [] as string[],
				busyDays: [] as string[],
				bookingsByStatus: {
					completed: {
						count: analytics.completedBookings,
						percentage: analytics.completionRate,
					},
					cancelled: {
						count: analytics.cancelledBookings,
						percentage: analytics.cancellationRate,
					},
					no_show: { count: 0, percentage: 0 },
				},
				geographicDistribution: [] as Array<{
					area: string;
					bookings: number;
					percentage: number;
				}>,
			}
		: {
				totalBookings: 324,
				completedBookings: 298,
				cancelledBookings: 18,
				noShowBookings: 8,
				completionRate: 92.0,
				averageWaitTime: 4.2,
				averageTripDuration: 28,
				peakHours: ["17:00-19:00", "21:00-23:00"],
				busyDays: ["Friday", "Saturday"],
				bookingsByStatus: {
					completed: { count: 298, percentage: 92.0 },
					cancelled: { count: 18, percentage: 5.6 },
					no_show: { count: 8, percentage: 2.4 },
				},
				geographicDistribution: [
					{ area: "CBD", bookings: 89, percentage: 27.5 },
					{ area: "Airport", bookings: 76, percentage: 23.5 },
					{ area: "North Shore", bookings: 52, percentage: 16.0 },
					{ area: "Eastern Suburbs", bookings: 45, percentage: 13.9 },
					{ area: "Inner West", bookings: 38, percentage: 11.7 },
					{ area: "Other", bookings: 24, percentage: 7.4 },
				],
			};

	return (
		<div className="grid gap-4">
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Car className="h-5 w-5 text-blue-600" />
							Booking Overview
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mb-2 font-bold text-3xl">
							{bookingData.totalBookings}
						</div>
						<p className="mb-4 text-muted-foreground text-sm">Total bookings</p>

						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Completion Rate</span>
								<span className="font-bold text-green-600">
									{bookingData.completionRate}%
								</span>
							</div>
							<Progress value={bookingData.completionRate} className="h-2" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Clock className="h-5 w-5 text-orange-600" />
							Performance Metrics
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div>
								<div className="font-bold text-2xl">
									{bookingData.averageWaitTime} min
								</div>
								<p className="text-muted-foreground text-sm">
									Average wait time
								</p>
							</div>
							<div>
								<div className="font-semibold text-xl">
									{bookingData.averageTripDuration} min
								</div>
								<p className="text-muted-foreground text-sm">
									Average trip duration
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5 text-purple-600" />
							Peak Times
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div>
								<p className="mb-2 font-medium text-sm">Peak Hours</p>
								<div className="space-y-1">
									{bookingData.peakHours.map((hour, index) => (
										<Badge key={index} variant="outline" className="mr-1">
											{hour}
										</Badge>
									))}
								</div>
							</div>
							<div>
								<p className="mb-2 font-medium text-sm">Busy Days</p>
								<div className="space-y-1">
									{bookingData.busyDays.map((day, index) => (
										<Badge key={index} variant="secondary" className="mr-1">
											{day}
										</Badge>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircle className="h-5 w-5 text-green-600" />
							Booking Status Breakdown
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="flex items-center gap-2 font-medium text-sm">
									<CheckCircle className="h-4 w-4 text-green-500" />
									Completed
								</span>
								<div className="flex items-center gap-2">
									<span className="font-bold text-sm">
										{bookingData.bookingsByStatus.completed.count}
									</span>
									<Badge
										variant="outline"
										className="bg-green-50 text-green-700"
									>
										{bookingData.bookingsByStatus.completed.percentage}%
									</Badge>
								</div>
							</div>
							<Progress
								value={bookingData.bookingsByStatus.completed.percentage}
								className="h-2"
							/>
						</div>

						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="flex items-center gap-2 font-medium text-sm">
									<XCircle className="h-4 w-4 text-red-500" />
									Cancelled
								</span>
								<div className="flex items-center gap-2">
									<span className="font-bold text-sm">
										{bookingData.bookingsByStatus.cancelled.count}
									</span>
									<Badge variant="outline" className="bg-red-50 text-red-700">
										{bookingData.bookingsByStatus.cancelled.percentage}%
									</Badge>
								</div>
							</div>
							<Progress
								value={bookingData.bookingsByStatus.cancelled.percentage}
								className="h-2"
							/>
						</div>

						<div>
							<div className="mb-2 flex items-center justify-between">
								<span className="flex items-center gap-2 font-medium text-sm">
									<Clock className="h-4 w-4 text-yellow-500" />
									No Show
								</span>
								<div className="flex items-center gap-2">
									<span className="font-bold text-sm">
										{bookingData.bookingsByStatus.no_show.count}
									</span>
									<Badge
										variant="outline"
										className="bg-yellow-50 text-yellow-700"
									>
										{bookingData.bookingsByStatus.no_show.percentage}%
									</Badge>
								</div>
							</div>
							<Progress
								value={bookingData.bookingsByStatus.no_show.percentage}
								className="h-2"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="h-5 w-5 text-red-600" />
							Geographic Distribution
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{bookingData.geographicDistribution.map((area, index) => (
								<div
									key={index}
									className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
								>
									<div>
										<p className="font-medium text-sm">{area.area}</p>
										<p className="text-muted-foreground text-xs">
											{area.bookings} bookings
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Progress value={area.percentage} className="h-2 w-16" />
										<Badge variant="outline" className="text-xs">
											{area.percentage}%
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
