import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import {
	Activity,
	AlertTriangle,
	ArrowRightIcon,
	Calendar,
	Car,
	CheckCircle,
	Clock,
	Loader2,
	MapPin,
	Package,
	Star,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	AnalyticsCard,
	type AnalyticsCardData,
} from "@/components/analytics-card";
import { BookingDetailsModal } from "@/features/customer/_components/booking-details-modal";
import { useUnifiedUserBookingsQuery } from "@/hooks/query/use-unified-user-bookings-query";
import { useUserQuery } from "@/hooks/query/use-user-query";

export const Route = createFileRoute("/_marketing/dashboard-overview")({
	component: CustomerDashboard,
});

function CustomerDashboard() {
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	const {
		data: bookingsData,
		isLoading,
		error,
	} = useUnifiedUserBookingsQuery({
		limit: 50,
		offset: 0,
	});

	const bookings = bookingsData?.data || [];
	const [selectedBooking, setSelectedBooking] = useState<any>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleViewDetails = (booking: any) => {
		setSelectedBooking(booking);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedBooking(null);
	};

	// Helper functions
	const formatPrice = (priceInCents: number) =>
		`$${(priceInCents / 100).toFixed(0)}`;

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (date: string | Date) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "driver_assigned":
				return "bg-blue-100 text-blue-800";
			case "in_progress":
				return "bg-purple-100 text-purple-800";
			case "completed":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
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

	// Calculate stats from real data
	const stats = useMemo(() => {
		const upcoming = bookings.filter(
			(b) =>
				new Date(b.scheduledPickupTime) > new Date() &&
				!["completed", "cancelled"].includes(b.status),
		).length;

		const inProgress = bookings.filter(
			(b) => b.status === "in_progress",
		).length;
		const completed = bookings.filter((b) => b.status === "completed").length;
		const total = bookings.length;

		return { upcoming, inProgress, completed, total };
	}, [bookings]);

	// Analytics card data with real booking stats
	const bookingStatsData: AnalyticsCardData[] = [
		{
			id: "upcoming",
			title: "Upcoming",
			value: stats.upcoming,
			icon: Calendar,
			bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
			iconBg: "bg-blue-500",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "in-progress",
			title: "In Progress",
			value: stats.inProgress,
			icon: Clock,
			bgGradient: "bg-gradient-to-br from-orange-50 to-orange-100",
			iconBg: "bg-orange-500",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "completed",
			title: "Completed",
			value: stats.completed,
			icon: Car,
			bgGradient: "bg-gradient-to-br from-green-50 to-green-100",
			iconBg: "bg-green-500",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "total",
			title: "Total",
			value: stats.total,
			icon: Package,
			bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100",
			iconBg: "bg-purple-500",
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	// Loading state
	if (isLoading || sessionLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-gray-600">
					{sessionLoading
						? "Setting up session..."
						: "Loading your dashboard..."}
				</span>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="py-12 text-center">
				<AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
				<h3 className="mb-2 font-medium text-gray-900 text-lg">
					Failed to load dashboard
				</h3>
				<p className="text-gray-600">Please try again later</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Welcome Section */}
			<div className="space-y-2 text-center md:text-left">
				<h1 className="font-bold text-2xl tracking-tight md:text-3xl">
					Welcome back!
				</h1>
				<p className="text-muted-foreground text-sm md:text-base">
					Your luxury travel dashboard with real-time booking management.
				</p>
			</div>

			{/* Booking Stats */}
			<div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
				{bookingStatsData.map((data) => (
					<AnalyticsCard key={data.id} data={data} view="compact" />
				))}
			</div>

			{/* Quick Actions - Mobile-First Design */}
			<div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
				<Card className="group touch-manipulation transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">
					<CardHeader className="pb-3">
						<div className="flex items-start space-x-3">
							<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
								<Package className="h-5 w-5 text-white sm:h-6 sm:w-6" />
							</div>
							<div className="min-w-0 flex-1">
								<CardTitle className="font-bold text-foreground text-lg leading-tight sm:text-xl">
									Luxury Services
								</CardTitle>
								<CardDescription className="mt-1 text-muted-foreground text-sm leading-relaxed">
									Premium experiences
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
								Airport transfers, city tours, wine country experiences, and
								event transportation.
							</p>
							<Button
								className="h-11 w-full font-medium text-sm transition-colors group-hover:bg-primary/90 sm:h-12 sm:text-base"
								asChild
							>
								<Link to="/dashboard/services">
									<Package className="mr-2 h-4 w-4" />
									Browse Services
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="group touch-manipulation transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">
					<CardHeader className="pb-3">
						<div className="flex items-start space-x-3">
							<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
								<Car className="h-5 w-5 text-white sm:h-6 sm:w-6" />
							</div>
							<div className="min-w-0 flex-1">
								<CardTitle className="font-bold text-foreground text-lg leading-tight sm:text-xl">
									Custom Quote
								</CardTitle>
								<CardDescription className="mt-1 text-muted-foreground text-sm leading-relaxed">
									Flexible bookings
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
								Custom routes, multiple stops, flexible timing, and personalized
								requirements.
							</p>
							<Button
								className="h-11 w-full font-medium text-sm sm:h-12 sm:text-base"
								variant="outline"
								asChild
							>
								<Link to="/dashboard/instant-quote">
									<Car className="mr-2 h-4 w-4" />
									Get Quote
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Bookings List */}
			<div>
				<div>
					<h2 className="font-semibold text-lg">Your Bookings</h2>
					<p className="mb-6 max-w-sm text-muted-foreground text-sm leading-relaxed">
						All your past and upcoming bookings with real-time status tracking.
					</p>
				</div>
				<div className="flex flex-col gap-4">
					{bookings.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center md:py-12">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted md:h-16 md:w-16">
								<Calendar className="h-6 w-6 text-muted-foreground md:h-8 md:w-8" />
							</div>
							<h3 className="mb-2 font-semibold text-base md:text-lg">
								No bookings yet
							</h3>
							<p className="mb-6 max-w-sm px-4 text-muted-foreground text-sm leading-relaxed md:px-0">
								You haven't made any bookings yet. Start by browsing our luxury
								services to book your next journey.
							</p>
							<Button className="h-10 w-full max-w-xs md:h-11" asChild>
								<Link to="/dashboard/services">
									<Package className="mr-2 h-4 w-4" />
									Browse Services
								</Link>
							</Button>
						</div>
					) : (
						<div className="mb-8 flex flex-col gap-4">
							{bookings.slice(0, 3).map((booking) => (
								<div
									key={booking.id}
									className={cn(
										"rounded-lg border border-l-4 border-l-primary/20",
									)}
								>
									<div className="p-4">
										<div className="grid grid-cols-1 gap-2 lg:grid-cols-4">
											{/* Booking Info */}
											<div className="space-y-2 lg:col-span-2">
												<div className="flex items-center gap-2">
													<Badge
														className={cn(
															"text-xs",
															getStatusColor(booking.status),
														)}
													>
														{getStatusIcon(booking.status)}
														<span className="ml-1 capitalize">
															{booking.status.replace("_", " ")}
														</span>
													</Badge>
													<Badge variant="outline">{booking.bookingType}</Badge>
												</div>
												<div className="flex items-center justify-between gap-2">
													<h3 className="font-semibold text-lg">
														{booking.bookingType === "package"
															? "Premium Service"
															: "Custom Journey"}
													</h3>
													<Button
														variant="ghost"
														size="sm"
														className="self-start text-primary hover:text-primary/80 sm:self-auto"
														onClick={() => handleViewDetails(booking)}
													>
														<span className="hidden sm:inline">
															View Details
														</span>
														<span className="sm:hidden">Details</span>
														<ArrowRightIcon className="ml-1 h-4 w-4" />
													</Button>
												</div>
												<div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
													<div className="space-y-3 sm:space-y-4 xl:col-span-2">
														<div className="space-y-2 sm:space-y-3">
															{/* Route information */}
															<div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:gap-3">
																<div className="flex min-w-0 items-center gap-2 font-medium text-xs">
																	<MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
																	<span className="truncate">
																		{booking.originAddress}
																	</span>
																</div>
																<div className="flex-shrink-0 self-center">
																	<ArrowRightIcon className="h-4 w-4 rotate-90 text-muted-foreground sm:rotate-0" />
																</div>
																<div className="flex min-w-0 items-center gap-2 font-medium text-xs">
																	<MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
																	<span className="truncate">
																		{booking.destinationAddress}
																	</span>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>

											<div className="flex flex-row items-center justify-between">
												{/* Date & Time */}
												<div className="flex flex-row gap-2">
													<div>
														<span className="font-medium text-gray-900 text-xs">
															Pickup Date
														</span>
														<p className="text-gray-600 text-xs">
															{formatDate(booking.scheduledPickupTime)}
														</p>
													</div>
													<div>
														<span className="font-medium text-gray-900 text-xs">
															Time
														</span>
														<p className="text-gray-600 text-xs">
															{formatTime(booking.scheduledPickupTime)}
														</p>
													</div>
												</div>
											</div>
										</div>

										{/* Special Requests */}
										{booking.specialRequests && (
											<>
												<Separator className="my-4" />
												<div>
													<span className="font-medium text-gray-900 text-sm">
														Special Requests:
													</span>
													<p className="mt-1 text-gray-600 text-sm">
														{booking.specialRequests}
													</p>
												</div>
											</>
										)}
									</div>
								</div>
							))}
							{bookings.length > 3 && (
								<Card className="transition-shadow hover:shadow-md">
									<CardContent className="p-6 text-center">
										<h3 className="mb-2 font-semibold text-lg">
											{bookings.length - 3} more bookings
										</h3>
										<p className="mb-4 text-muted-foreground text-sm">
											View all your booking history and manage upcoming trips
										</p>
										<Button variant="outline" asChild>
											<Link to="/dashboard/services">
												<Package className="mr-2 h-4 w-4" />
												Browse Services
											</Link>
										</Button>
									</CardContent>
								</Card>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Booking Details Modal */}
			<BookingDetailsModal
				booking={selectedBooking}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
			/>
		</div>
	);
}
