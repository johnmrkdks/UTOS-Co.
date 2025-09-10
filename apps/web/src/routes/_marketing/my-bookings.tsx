import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import { Calendar, Package, Car, Clock, MapPin, Users, CheckCircle, AlertTriangle, ArrowRightIcon, Loader2 } from "lucide-react";
import { useUnifiedUserBookingsQuery } from "@/hooks/query/use-unified-user-bookings-query";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useMemo, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { BookingDetailsPage } from "@/features/customer/_components/booking-details-page";
import { BookingDetailsModal } from "@/features/customer/_components/booking-details-modal";
import { BookingActions } from "@/features/customer/_components/booking-actions";
import { BookingStatusIndicator } from "@/features/customer/_components/booking-status-indicator";

export const Route = createFileRoute("/_marketing/my-bookings")({
	component: CustomerBookingsPage,
});


function CustomerBookingsPage() {
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	const { data: bookingsData, isLoading, error } = useUnifiedUserBookingsQuery({
		limit: 50,
		offset: 0,
	})

	const bookings = bookingsData?.data || [];
	const [selectedBooking, setSelectedBooking] = useState<any>(null);
	const [showDetailsPage, setShowDetailsPage] = useState(false);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const isMobile = useIsMobile();

	const handleViewDetails = (booking: any) => {
		setSelectedBooking(booking);
		if (isMobile) {
			setShowDetailsPage(true);
		} else {
			setShowDetailsModal(true);
		}
	};

	const handleCloseDetailsPage = () => {
		setShowDetailsPage(false);
		setSelectedBooking(null);
	};

	const handleCloseDetailsModal = () => {
		setShowDetailsModal(false);
		setSelectedBooking(null);
	};

	// Helper functions
	const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(0)}`;

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		})
	}

	const formatTime = (date: string | Date) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		})
	}

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
	}

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
	}

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
	]

	return (
		<div className="py-8 md:py-12 bg-background min-h-screen">
			<div className="container mx-auto px-6">
				<div className="space-y-6">
					{/* Page Header */}
					<div className="space-y-2 text-center md:text-left">
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
							My Bookings
						</h1>
						<p className="text-muted-foreground text-sm md:text-base">
							View and manage your luxury travel bookings.
						</p>
					</div>

			{/* Loading State */}
			{(isLoading || sessionLoading) && (
				<div className="flex justify-center items-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<span className="ml-2 text-gray-600">
						{sessionLoading ? "Setting up session..." : "Loading your bookings..."}
					</span>
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

			{!isLoading && !sessionLoading && !error && (
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
					<div>
						<div>
							<h2 className="font-semibold text-lg">Booking History</h2>
							<p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed">
								All your past and upcoming bookings with real-time status tracking.
							</p>
						</div>
						
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
									<Link to="/services">
										<Package className="h-4 w-4 mr-2" />
										Browse Services
									</Link>
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<div className="min-w-full bg-white rounded-xl border border-gray-200 shadow-sm">
									{/* Desktop Table Header */}
									<div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/30 text-sm font-semibold text-gray-800 rounded-t-xl">
										<div className="col-span-1">Status</div>
										<div className="col-span-2">Service</div>
										<div className="col-span-3">Route</div>
										<div className="col-span-2">Pickup Date & Time</div>
										<div className="col-span-1">Price</div>
										<div className="col-span-3">Actions</div>
									</div>
									
									{/* Bookings Rows */}
									{bookings.map((booking) => (
										<div key={booking.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-all duration-200">
											{/* Mobile Card View (lg:hidden) */}
											<div className="lg:hidden p-6 space-y-4 bg-gradient-to-r from-white to-gray-50/20">
												{/* Header with status and service type */}
												<div className="space-y-4">
													<div className="flex items-start justify-between">
														<div className="space-y-2">
															<h3 className="font-semibold text-lg text-gray-900">
																{booking.bookingType === "package" ? "Premium Service" : "Custom Journey"}
															</h3>
															<BookingStatusIndicator
																status={booking.status}
																bookingType={booking.bookingType}
																size="default"
																showUpcoming={true}
																scheduledPickupTime={booking.scheduledPickupTime}
																className="flex-wrap"
															/>
														</div>
														<div className="text-right">
															<div className="font-bold text-xl text-primary">
																{formatPrice(booking.quotedAmount)}
															</div>
															<Badge variant="secondary" className="text-xs mt-1 capitalize bg-primary/10 text-primary border-primary/20">{booking.bookingType}</Badge>
														</div>
													</div>
												</div>
												
												{/* Route Information */}
												<div className="bg-gray-50 rounded-xl p-4 space-y-3">
													<div className="flex items-center gap-3">
														<div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
														<div className="flex-1">
															<p className="text-sm font-medium text-gray-600">Pickup</p>
															<p className="text-base text-gray-900 leading-5">{booking.originAddress}</p>
														</div>
													</div>
													<div className="flex items-center gap-3">
														<div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
														<div className="flex-1">
															<p className="text-sm font-medium text-gray-600">Destination</p>
															<p className="text-base text-gray-900 leading-5">{booking.destinationAddress}</p>
														</div>
													</div>
												</div>
												
												{/* Date and Time */}
												<div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-xl">
													<div className="text-center">
														<p className="text-sm font-medium text-blue-600">Pickup Date</p>
														<p className="text-base font-semibold text-blue-900">{formatDate(booking.scheduledPickupTime)}</p>
													</div>
													<div className="w-px h-8 bg-blue-200"></div>
													<div className="text-center">
														<p className="text-sm font-medium text-blue-600">Pickup Time</p>
														<p className="text-base font-semibold text-blue-900">{formatTime(booking.scheduledPickupTime)}</p>
													</div>
												</div>
												
												{/* Actions */}
												<div className="flex items-center justify-between pt-2">
													{/* View Details Button */}
													<Button
														variant="outline"
														size="lg"
														className="flex-1 mr-3 text-primary hover:text-primary/90 hover:bg-primary/5 border-primary/30 font-medium"
														onClick={() => handleViewDetails(booking)}
													>
														<span>View Details</span>
														<ArrowRightIcon className="h-5 w-5 ml-2" />
													</Button>
													
													{/* Dropdown Menu */}
													<BookingActions 
														booking={booking}
														variant="dropdown"
														onViewDetails={handleViewDetails}
													/>
												</div>
											</div>

											{/* Desktop Table Row (hidden lg:grid) */}
											<div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-5 items-center">
												{/* Status */}
												<div className="col-span-1">
													<BookingStatusIndicator
														status={booking.status}
														bookingType={booking.bookingType}
														size="sm"
														showUpcoming={true}
														scheduledPickupTime={booking.scheduledPickupTime}
														className="flex-col items-start gap-1"
													/>
												</div>
												
												{/* Service */}
												<div className="col-span-2">
													<div className="font-semibold text-sm text-gray-900">
														{booking.bookingType === "package" ? "Premium Service" : "Custom Journey"}
													</div>
													<Badge variant="secondary" className="text-xs mt-1 bg-primary/10 text-primary border-primary/20 capitalize">{booking.bookingType}</Badge>
												</div>
												
												{/* Route */}
												<div className="col-span-3">
													<div className="space-y-1">
														<div className="flex items-center gap-2 text-sm">
															<div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
															<span className="truncate text-green-700 font-medium">{booking.originAddress}</span>
														</div>
														<div className="flex items-center gap-2 text-sm">
															<div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
															<span className="truncate text-red-700 font-medium">{booking.destinationAddress}</span>
														</div>
													</div>
												</div>
												
												{/* Date & Time */}
												<div className="col-span-2">
													<div className="text-sm">
														<div className="font-semibold text-gray-900">{formatDate(booking.scheduledPickupTime)}</div>
														<div className="text-gray-600">{formatTime(booking.scheduledPickupTime)}</div>
													</div>
												</div>
												
												{/* Price */}
												<div className="col-span-1">
													<div className="font-bold text-lg text-primary">
														{formatPrice(booking.quotedAmount)}
													</div>
												</div>
												
												{/* Actions */}
												<div className="col-span-3">
													<div className="flex items-center gap-2">
														{/* View Details Button */}
														<Button
															variant="outline"
															size="sm"
															className="text-primary hover:text-primary/90 hover:bg-primary/5 border-primary/30 font-medium"
															onClick={() => handleViewDetails(booking)}
														>
															<span>Details</span>
															<ArrowRightIcon className="h-4 w-4 ml-1" />
														</Button>
														
														{/* Dropdown Menu */}
														<BookingActions 
															booking={booking}
															variant="dropdown"
															onViewDetails={handleViewDetails}
														/>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</>
			)}

					{/* Mobile: Full-screen Booking Details Page */}
					{showDetailsPage && selectedBooking && (
						<div className="fixed inset-0 z-50 bg-background">
							<BookingDetailsPage
								booking={selectedBooking}
								onClose={handleCloseDetailsPage}
							/>
						</div>
					)}

					{/* Tablet/Desktop: Booking Details Modal */}
					<BookingDetailsModal
						booking={selectedBooking}
						isOpen={showDetailsModal}
						onClose={handleCloseDetailsModal}
					/>
				</div>
			</div>
		</div>
	)
}