import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import { Calendar, Package, Car, Clock, MapPin, Users, CheckCircle, AlertTriangle, ArrowRightIcon, Loader2, Navigation, Phone, Star, DollarSign, MessageSquare } from "lucide-react";
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
	const [showDriverInfoModal, setShowDriverInfoModal] = useState(false);
	const [selectedDriverBooking, setSelectedDriverBooking] = useState<any>(null);
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

	const handleViewDriverInfo = (booking: any) => {
		setSelectedDriverBooking(booking);
		setShowDriverInfoModal(true);
	};

	const handleCloseDriverInfoModal = () => {
		setShowDriverInfoModal(false);
		setSelectedDriverBooking(null);
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
			<div className="container mx-auto px-6 max-w-4xl">
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

					{/* Bookings List - Card Based Design */}
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
							<div className="space-y-4">
								{bookings.map((booking) => {
									const isUpcoming = new Date(booking.scheduledPickupTime) > new Date() && !["completed", "cancelled"].includes(booking.status);
									const isPast = new Date(booking.scheduledPickupTime) < new Date() || ["completed", "cancelled"].includes(booking.status);
									
									return (
										<Card key={booking.id} className="overflow-hidden shadow-sm border border-gray-200 bg-white hover:shadow-md transition-all duration-200">
											<CardContent className="p-4">
												{/* Header with Title and Status */}
												<div className="flex items-center justify-between mb-3">
													<h3 className="text-lg font-semibold text-gray-900">
														{booking.bookingType === "package" ? "Premium Service" : "Airport Transfer"}
													</h3>
													<div className="flex items-center gap-2">
														<Badge 
															className={cn(
																"text-xs px-2 py-1 text-white",
																isUpcoming && "bg-blue-500",
																booking.status === "in_progress" && "bg-green-500",
																booking.status === "completed" && "bg-gray-500",
																booking.status === "cancelled" && "bg-red-500"
															)}
														>
															{isUpcoming ? 'Upcoming' : booking.status === "in_progress" ? 'In Progress' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
														</Badge>
														<BookingActions 
															booking={booking}
															variant="dropdown"
															onViewDetails={handleViewDetails}
														/>
													</div>
												</div>

												{/* Service Type Badge and Time */}
												<div className="flex items-center gap-2 mb-4">
													<Badge 
														variant="secondary" 
														className={cn(
															"text-xs px-2 py-1",
															booking.bookingType === "package" && "bg-gray-100 text-gray-700",
															booking.bookingType === "custom" && "bg-gray-100 text-gray-700"
														)}
													>
														{booking.bookingType === "package" ? "Transportation" : "Custom"}
													</Badge>
													<span className="text-sm text-gray-600">
														{formatTime(booking.scheduledPickupTime)}
													</span>
												</div>

												{/* Date and Route */}
												<div className="flex items-center gap-4 mb-4">
													<div className="flex items-center gap-2">
														<Calendar className="h-4 w-4 text-gray-400" />
														<span className="text-sm text-gray-700">
															{formatDate(booking.scheduledPickupTime)}
														</span>
													</div>
													<div className="flex items-center gap-2 flex-1 min-w-0">
														<Navigation className="h-4 w-4 text-gray-400" />
														<div className="flex-1 min-w-0">
															<div className="text-sm font-medium text-gray-900">
																{booking.originAddress.split(',')[0]}
															</div>
															<div className="flex items-center gap-2">
																<div className="text-xs text-gray-500">
																	to {booking.destinationAddress.split(',')[0]}
																</div>
																{booking.stops && booking.stops.length > 0 && (
																	<Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
																		{booking.stops.length} stop{booking.stops.length > 1 ? 's' : ''}
																	</Badge>
																)}
															</div>
														</div>
													</div>
													<div className="text-right">
														<div className="text-lg font-bold text-primary">
															{formatPrice(booking.quotedAmount)}
														</div>
													</div>
												</div>

												{/* Driver Info (if assigned) */}
												{booking.driver && (
													<div className="bg-blue-50 rounded-lg p-3 mb-4">
														<div className="flex items-center gap-2">
															<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
																<Car className="h-4 w-4 text-blue-600" />
															</div>
															<div className="flex-1">
																<div className="text-sm font-medium text-blue-900">
																	{booking.driver.user?.name || 'Driver Assigned'}
																</div>
																<div className="text-xs text-blue-700">
																	{booking.driver.car?.name || 'Vehicle assigned'}
																</div>
															</div>
															{/* Rating temporarily hidden - will be implemented later */}
														</div>
													</div>
												)}

												{/* Special Requests (if any) */}
												{booking.specialRequests && (
													<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
														<div className="flex items-start gap-2">
															<AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
															<div>
																<p className="text-sm font-medium text-yellow-800">Special Requests</p>
																<p className="text-sm text-yellow-700">{booking.specialRequests}</p>
															</div>
														</div>
													</div>
												)}

												{/* Action Buttons */}
												<div className="flex gap-3">
													<Button
														variant="outline"
														className="flex-1 text-gray-700 hover:bg-gray-50 border-gray-300"
														onClick={() => handleViewDetails(booking)}
													>
														View Details
													</Button>
													{booking.driver && (
														<Button
															className="flex-1"
															onClick={() => handleViewDriverInfo(booking)}
														>
															View Driver Info
														</Button>
													)}
												</div>
											</CardContent>
										</Card>
									);
								})}
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

					{/* Driver Info Modal */}
					<Dialog open={showDriverInfoModal} onOpenChange={setShowDriverInfoModal}>
						<DialogContent className="max-w-md">
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2">
									<Car className="h-5 w-5" />
									Driver Information
								</DialogTitle>
								<DialogDescription>
									Your assigned driver details
								</DialogDescription>
							</DialogHeader>
							
							{selectedDriverBooking?.driver && (
								<div className="space-y-4 py-4">
									{/* Driver Details */}
									<div className="space-y-3">
										<div className="flex items-center gap-3">
											{selectedDriverBooking.driver.user?.image ? (
												<img 
													src={selectedDriverBooking.driver.user.image} 
													alt={selectedDriverBooking.driver.user?.name}
													className="h-12 w-12 rounded-full object-cover"
												/>
											) : (
												<div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
													<Users className="h-6 w-6 text-gray-500" />
												</div>
											)}
											<div className="flex-1">
												<h3 className="font-semibold text-lg">{selectedDriverBooking.driver.user?.name}</h3>
												{/* Rating temporarily hidden - will be implemented later */}
											</div>
										</div>
										
										{/* Contact Information */}
										<div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
											<div>
												<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
												<p className="text-sm font-medium flex items-center gap-1">
													<Phone className="h-3 w-3" />
													{selectedDriverBooking.driver.phoneNumber || "Not provided"}
												</p>
											</div>
											<div>
												<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">License</p>
												<p className="text-sm font-medium">{selectedDriverBooking.driver.licenseNumber}</p>
											</div>
										</div>
									</div>

									{/* Vehicle Information */}
									{selectedDriverBooking.driver.car && (
										<div className="space-y-2">
											<h4 className="font-medium text-sm">Vehicle Information</h4>
											<div className="p-3 bg-muted/30 rounded-lg space-y-2">
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">Vehicle:</span>
													<span className="text-sm font-medium">{selectedDriverBooking.driver.car.name}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">Plate:</span>
													<span className="text-sm font-medium">{selectedDriverBooking.driver.car.licensePlate}</span>
												</div>
												{selectedDriverBooking.driver.car.color && (
													<div className="flex justify-between">
														<span className="text-sm text-muted-foreground">Color:</span>
														<span className="text-sm font-medium">{selectedDriverBooking.driver.car.color}</span>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Action Buttons */}
									<div className="flex gap-2 pt-4 border-t">
										<Button 
											variant="outline" 
											onClick={handleCloseDriverInfoModal}
											className="flex-1"
										>
											Close
										</Button>
										{selectedDriverBooking.driver.phoneNumber && (
											<>
												<Button 
													onClick={() => window.open(`tel:${selectedDriverBooking.driver.phoneNumber}`)}
													className="flex-1"
												>
													<Phone className="h-4 w-4 mr-2" />
													Call Driver
												</Button>
												<Button 
													onClick={() => window.open(`sms:${selectedDriverBooking.driver.phoneNumber}`)}
													variant="outline"
													className="flex-1"
												>
													<MessageSquare className="h-4 w-4 mr-2" />
													Message Driver
												</Button>
											</>
										)}
									</div>
								</div>
							)}
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	)
}