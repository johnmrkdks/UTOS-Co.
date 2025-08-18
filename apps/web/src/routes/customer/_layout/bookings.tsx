import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import { Calendar, Package, Car, Clock, MapPin, Users, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useGetUserBookingsQuery } from "@/features/customer/_hooks/query/use-get-user-bookings-query";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useMemo } from "react";

export const Route = createFileRoute("/customer/_layout/bookings")({
	component: CustomerBookingsPage,
});

function CustomerBookingsPage() {
	const { session } = useUserQuery();
	const user = session?.user;
	const { data: bookingsData, isLoading, error } = useGetUserBookingsQuery({
		userId: user?.id,
		limit: 50,
		offset: 0,
	});

	const bookings = bookingsData?.data || [];

	// Helper functions
	const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(0)}`;
	
	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		});
	};

	const formatTime = (date: string | Date) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed": return "bg-green-100 text-green-800";
			case "pending": return "bg-yellow-100 text-yellow-800";
			case "driver_assigned": return "bg-blue-100 text-blue-800";
			case "in_progress": return "bg-purple-100 text-purple-800";
			case "completed": return "bg-green-100 text-green-800";
			case "cancelled": return "bg-red-100 text-red-800";
			default: return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "confirmed":
			case "completed":
				return <CheckCircle className="h-4 w-4" />;
			case "pending":
				return <Clock className="h-4 w-4" />;
			case "cancelled":
				return <AlertTriangle className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
	};

	// Calculate stats
	const stats = useMemo(() => {
		const upcoming = bookings.filter(b => 
			new Date(b.scheduledPickupTime) > new Date() && 
			!["completed", "cancelled"].includes(b.status)
		).length;
		
		const inProgress = bookings.filter(b => b.status === "in_progress").length;
		const completed = bookings.filter(b => b.status === "completed").length;
		const total = bookings.length;

		return { upcoming, inProgress, completed, total };
	}, [bookings]);

	// Analytics card data for customer bookings
	const bookingStatsData: AnalyticsCardData[] = [
		{
			id: 'upcoming',
			title: 'Upcoming',
			value: stats.upcoming,
			icon: Calendar,
			bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
			iconBg: 'bg-blue-500',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'in-progress',
			title: 'In Progress',
			value: stats.inProgress,
			icon: Clock,
			bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
			iconBg: 'bg-orange-500',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'completed',
			title: 'Completed',
			value: stats.completed,
			icon: Car,
			bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
			iconBg: 'bg-green-500',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'total',
			title: 'Total',
			value: stats.total,
			icon: Package,
			bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
			iconBg: 'bg-purple-500',
			showIcon: true,
			showBackgroundIcon: true
		}
	];

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="space-y-2 text-center md:text-left">
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Bookings</h1>
				<p className="text-muted-foreground text-sm md:text-base">
					View and manage your luxury travel bookings.
				</p>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex justify-center items-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<span className="ml-2 text-gray-600">Loading your bookings...</span>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="text-center py-12">
					<AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load bookings</h3>
					<p className="text-gray-600">Please try again later</p>
				</div>
			)}

			{!isLoading && !error && (
				<>
					{/* Booking Stats */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
						{bookingStatsData.map((data) => (
							<AnalyticsCard 
								key={data.id} 
								data={data} 
								view="compact" 
							/>
						))}
					</div>

					{/* Bookings List */}
					<Card>
						<CardHeader>
							<CardTitle>Booking History</CardTitle>
							<CardDescription>
								All your past and upcoming bookings with real-time status tracking.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{bookings.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
									<div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center mb-4">
										<Calendar className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
									</div>
									<h3 className="font-semibold text-base md:text-lg mb-2">No bookings yet</h3>
									<p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed px-4 md:px-0">
										You haven't made any bookings yet. Start by browsing our 
										luxury services to book your next journey.
									</p>
									<Button className="h-10 md:h-11 w-full max-w-xs" asChild>
										<Link to="/customer/services">
											<Package className="h-4 w-4 mr-2" />
											Browse Services
										</Link>
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									{bookings.map((booking) => (
										<Card key={booking.id} className="border-l-4 border-l-primary/20">
											<CardContent className="pt-6">
												<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
													{/* Booking Info */}
													<div className="lg:col-span-2 space-y-2">
														<div className="flex items-center gap-2">
															<Badge className={getStatusColor(booking.status)}>
																{getStatusIcon(booking.status)}
																<span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
															</Badge>
															<Badge variant="outline">{booking.bookingType}</Badge>
														</div>
														<h3 className="font-semibold text-lg">
															{booking.bookingType === "package" ? "Service Booking" : "Custom Trip"}
														</h3>
														<div className="space-y-1 text-sm text-gray-600">
															<div className="flex items-center gap-2">
																<MapPin className="h-4 w-4" />
																<span>{booking.originAddress}</span>
															</div>
															<div className="flex items-center gap-2 pl-6">
																→ {booking.destinationAddress}
															</div>
															<div className="flex items-center gap-2">
																<Users className="h-4 w-4" />
																<span>{booking.passengerCount} passenger{booking.passengerCount !== 1 ? 's' : ''}</span>
															</div>
														</div>
													</div>

													{/* Date & Time */}
													<div className="space-y-2">
														<div>
															<span className="text-sm font-medium text-gray-900">Pickup Date</span>
															<p className="text-sm text-gray-600">{formatDate(booking.scheduledPickupTime)}</p>
														</div>
														<div>
															<span className="text-sm font-medium text-gray-900">Time</span>
															<p className="text-sm text-gray-600">{formatTime(booking.scheduledPickupTime)}</p>
														</div>
													</div>

													{/* Price & Actions */}
													<div className="flex flex-col justify-between space-y-2">
														<div className="text-right">
															<div className="text-2xl font-bold text-primary">
																{formatPrice(booking.finalAmount || booking.quotedAmount)}
															</div>
															{booking.finalAmount && booking.finalAmount !== booking.quotedAmount && (
																<div className="text-sm text-gray-500 line-through">
																	{formatPrice(booking.quotedAmount)}
																</div>
															)}
														</div>
														<div className="flex gap-2">
															<Button variant="outline" size="sm" className="flex-1">
																View Details
															</Button>
														</div>
													</div>
												</div>

												{/* Special Requests */}
												{booking.specialRequests && (
													<>
														<Separator className="my-4" />
														<div>
															<span className="text-sm font-medium text-gray-900">Special Requests:</span>
															<p className="text-sm text-gray-600 mt-1">{booking.specialRequests}</p>
														</div>
													</>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}