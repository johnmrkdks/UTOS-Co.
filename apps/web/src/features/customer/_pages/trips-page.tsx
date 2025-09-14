import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import {
	Calendar,
	Package,
	Car,
	Clock,
	MapPin,
	Users,
	CheckCircle,
	AlertTriangle,
	Loader2,
	Phone,
	DollarSign,
	MoreVertical,
	RefreshCwIcon,
	ActivityIcon,
	UserIcon,
	X,
	CircleDot,
} from "lucide-react";
import { useUnifiedUserBookingsQuery } from "@/hooks/query/use-unified-user-bookings-query";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useMemo, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { BookingActions } from "@/features/customer/_components/booking-actions";
import { format } from "date-fns";

export function CustomerTripsPage() {
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	const { data: bookingsData, isLoading, error, refetch } = useUnifiedUserBookingsQuery({
		limit: 50,
		offset: 0,
	})

	const bookings = bookingsData?.data || [];
	const [selectedBooking, setSelectedBooking] = useState<any>(null);
	const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);

	// Memoize mobile detection to prevent re-evaluation during render
	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}, []);

	const handleViewDetails = (booking: any) => {
		setSelectedBooking(booking);
		setBookingDetailsOpen(true);
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

	// Categorize bookings - similar to driver interface
	const categorizedBookings = useMemo(() => {
		const now = new Date();

		// Active trips (currently happening or about to happen)
		const activeStatuses = ["confirmed", "driver_assigned", "driver_en_route", "in_progress", "arrived_pickup", "passenger_on_board"];
		const active = bookings.filter(b =>
			activeStatuses.includes(b.status)
		).sort((a, b) => new Date(a.scheduledPickupTime).getTime() - new Date(b.scheduledPickupTime).getTime());

		// Upcoming trips (future bookings)
		const upcoming = bookings.filter(b =>
			new Date(b.scheduledPickupTime) > now &&
			!["completed", "cancelled", "driver_assigned", "driver_en_route", "in_progress", "arrived_pickup", "passenger_on_board"].includes(b.status)
		).sort((a, b) => new Date(a.scheduledPickupTime).getTime() - new Date(b.scheduledPickupTime).getTime());

		return { upcoming, active };
	}, [bookings]);

	// Simple stats for active trips
	const tripStats = {
		activeTrips: categorizedBookings.active.filter(b => ['driver_en_route', 'in_progress', 'arrived_pickup', 'passenger_on_board'].includes(b.status)).length,
		confirmedTrips: categorizedBookings.active.filter(b => ['confirmed', 'driver_assigned'].includes(b.status)).length,
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/3"></div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-24 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	// Status-based color coding function
	const getStatusStyle = (status: string) => {
		const baseStyle = {
			borderLeftWidth: '4px',
			borderLeftStyle: 'solid' as const
		};

		switch (status) {
			case 'confirmed':
				return { ...baseStyle, borderLeftColor: '#3b82f6' }; // Blue
			case 'driver_assigned':
				return { ...baseStyle, borderLeftColor: '#eab308' }; // Yellow
			case 'driver_en_route':
			case 'in_progress':
				return { ...baseStyle, borderLeftColor: '#22c55e' }; // Green
			case 'arrived_pickup':
			case 'passenger_on_board':
				return { ...baseStyle, borderLeftColor: '#f97316' }; // Orange
			case 'completed':
				return { ...baseStyle, borderLeftColor: '#6b7280' }; // Gray
			case 'cancelled':
				return { ...baseStyle, borderLeftColor: '#ef4444' }; // Red
			default:
				return { ...baseStyle, borderLeftColor: '#d1d5db' }; // Light gray
		}
	};

	const BookingCard = ({ booking }: { booking: any }) => (
		<Card
			key={booking.id}
			style={getStatusStyle(booking.status)}
			className={cn(
				"bg-white transition-colors cursor-pointer active:bg-gray-50",
				isMobile
					? "border-r-0 border-t-0 border-b border-gray-200 rounded-none shadow-none"
					: "border-r border-t border-b border-gray-200 shadow-sm hover:shadow-md"
			)}
			onClick={() => handleViewDetails(booking)}
		>
			<CardContent className={cn(
				isMobile ? "px-3 py-2.5" : "p-4"
			)}>
				{isMobile ? (
					// Mobile optimized layout - similar to driver interface
					<>
						{/* Header - Time and Status */}
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-1.5">
								<Clock className="h-3.5 w-3.5 text-gray-500" />
								<div className="flex flex-col">
									<span className="text-sm font-semibold text-gray-900">
										{format(new Date(booking.scheduledPickupTime), "HH:mm")}
									</span>
									<span className="text-xs text-gray-500">
										{format(new Date(booking.scheduledPickupTime), "MMM dd, yyyy")}
									</span>
								</div>
							</div>
							<Badge
								variant={booking.status === 'completed' ? 'default' :
									booking.status === 'cancelled' ? 'destructive' :
									booking.status === 'confirmed' ? 'secondary' : 'outline'}
								className="text-xs px-2 py-0.5"
							>
								{booking.status.replace('_', ' ').toUpperCase()}
							</Badge>
						</div>

						{/* Route - Mobile optimized */}
						<div className="space-y-1 mb-2">
							<div className="flex items-center gap-2">
								<div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
								<p className="text-xs text-gray-700 truncate flex-1 max-w-[200px]">
									{(booking.originAddress || booking.pickupAddress)?.length > 35
										? (booking.originAddress || booking.pickupAddress)?.substring(0, 35) + '...'
										: (booking.originAddress || booking.pickupAddress)}
								</p>
							</div>
							{/* Stops (if any) */}
							{booking.stops && booking.stops.length > 0 && (
								<div className="flex items-center gap-2">
									<div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
									<p className="text-xs text-blue-600 truncate flex-1 max-w-[200px]">
										{booking.stops.length} stop{booking.stops.length > 1 ? 's' : ''}
									</p>
								</div>
							)}
							{booking.destinationAddress && (
								<div className="flex items-center gap-2">
									<div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
									<p className="text-xs text-gray-700 truncate flex-1 max-w-[200px]">
										{booking.destinationAddress?.length > 35
											? booking.destinationAddress?.substring(0, 35) + '...'
											: booking.destinationAddress}
									</p>
								</div>
							)}
						</div>

						{/* Price and Booking Type - Compact */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1.5">
								<DollarSign className="h-3.5 w-3.5 text-gray-500" />
								<span className="text-sm font-semibold text-gray-900">{formatPrice(booking.amount || 0)}</span>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
									<Button size="sm" variant="outline" className="h-7 w-7 p-0">
										<MoreVertical className="h-3.5 w-3.5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(booking); }}>
										View Details
									</DropdownMenuItem>
									<BookingActions booking={booking} />
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</>
				) : (
					// Desktop layout
					<>
						{/* Header with Time and Status */}
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-gray-500" />
								<div className="flex flex-col">
									<span className="font-semibold text-gray-900">
										{format(new Date(booking.scheduledPickupTime), "HH:mm")}
									</span>
									<span className="text-xs text-gray-500">
										{format(new Date(booking.scheduledPickupTime), "MMM dd, yyyy")}
									</span>
								</div>
							</div>
							<Badge
								variant={booking.status === 'completed' ? 'default' :
									booking.status === 'cancelled' ? 'destructive' :
									booking.status === 'confirmed' ? 'secondary' : 'outline'}
								className="text-xs font-medium"
							>
								{booking.status.replace('_', ' ').toUpperCase()}
							</Badge>
						</div>

						{/* Route */}
						<div className="space-y-1 mb-2">
							<div className="flex items-start gap-2">
								<div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
								<div className="flex-1 min-w-0">
									<p className="text-sm text-gray-900 truncate">{booking.originAddress || booking.pickupAddress}</p>
								</div>
							</div>
							{/* Stops (if any) */}
							{booking.stops && booking.stops.length > 0 && (
								<div className="flex items-start gap-2">
									<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm text-blue-600 truncate">
											{booking.stops.length} intermediate stop{booking.stops.length > 1 ? 's' : ''}
										</p>
									</div>
								</div>
							)}
							{booking.destinationAddress && (
								<div className="flex items-start gap-2">
									<div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm text-gray-900 truncate">{booking.destinationAddress}</p>
									</div>
								</div>
							)}
						</div>

						{/* Price and Actions */}
						<div className="flex items-center justify-between pt-2 border-t">
							<div className="flex items-center gap-1">
								<DollarSign className="h-4 w-4 text-gray-500" />
								<span className="font-semibold text-base">{formatPrice(booking.amount || 0)}</span>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
									<Button size="sm" variant="outline" className="h-8 w-8 p-0">
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(booking); }}>
										View Details
									</DropdownMenuItem>
									<BookingActions booking={booking} />
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);

	return (
		<div className={cn(
			isMobile ? "min-h-screen bg-gray-50 flex flex-col" : "min-h-screen bg-gray-50 p-4 max-w-4xl mx-auto"
		)}>
			{/* Header */}
			<div className={cn(
				"bg-white border-b flex-shrink-0",
				isMobile ? "px-4 py-3" : "rounded-lg mb-4 p-4"
			)}>
				<div className="flex items-center justify-between">
					<div>
						<h1 className={cn(
							"font-bold text-gray-900",
							isMobile ? "text-lg" : "text-2xl"
						)}>My Trips</h1>
						<p className="text-gray-600 text-xs">Your active and upcoming bookings</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						className={cn(isMobile ? "h-8 px-2" : "h-8")}
					>
						<RefreshCwIcon className="h-4 w-4" />
						{!isMobile && <span className="ml-2">Refresh</span>}
					</Button>
				</div>
			</div>

			{/* Active Trips Banner */}
			{tripStats.activeTrips > 0 && (
				<div className={cn(
					"bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 flex-shrink-0",
					isMobile ? "mx-0 px-4 py-3" : "mx-4 mb-4 rounded-lg px-4 py-3"
				)}>
					<div className="flex items-center gap-3">
						<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
						<div className="flex-1">
							<h3 className="font-semibold text-blue-900 text-sm">
								{tripStats.activeTrips === 1
									? "1 trip in progress"
									: `${tripStats.activeTrips} trips in progress`
								}
							</h3>
							<p className="text-blue-700 text-xs">
								{tripStats.confirmedTrips > 0 ? `${tripStats.confirmedTrips} confirmed • ` : ''}
								Tap any trip for details
							</p>
						</div>
						<div className="flex items-center gap-1">
							<ActivityIcon className="h-4 w-4 text-blue-600" />
						</div>
					</div>
				</div>
			)}

			<Tabs defaultValue="active" className={cn(isMobile ? "flex-1 flex flex-col" : "space-y-4")}>
				<div className={cn(
					"flex-shrink-0",
					isMobile ? "px-4 py-3 bg-white border-b" : "mb-4"
				)}>
					<TabsList>
						<TabsTrigger value="active">
							Active ({categorizedBookings.active.length})
						</TabsTrigger>
						<TabsTrigger value="upcoming">
							Upcoming ({categorizedBookings.upcoming.length})
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="active" className={cn(
					isMobile ? "flex-1 overflow-y-auto" : "space-y-4"
				)}>
					{categorizedBookings.active.length === 0 ? (
						<div className={cn(
							"flex items-center justify-center h-full",
							isMobile ? "px-4" : ""
						)}>
							<div className="text-center">
								<Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">No active trips</h3>
								<p className="text-gray-500 text-sm">You don't have any trips in progress.</p>
							</div>
						</div>
					) : (
						<div className={cn(
							isMobile ? "" : "grid gap-4"
						)}>
							{categorizedBookings.active.map((booking) => (
								<BookingCard key={booking.id} booking={booking} />
							))}
							{/* Bottom padding for mobile to ensure last item is visible */}
							{isMobile && (
								<div className="h-20"></div>
							)}
						</div>
					)}
				</TabsContent>

				<TabsContent value="upcoming" className={cn(
					isMobile ? "flex-1 overflow-y-auto" : "space-y-4"
				)}>
					{categorizedBookings.upcoming.length === 0 ? (
						<div className={cn(
							"flex items-center justify-center h-full",
							isMobile ? "px-4" : ""
						)}>
							<div className="text-center">
								<Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming trips</h3>
								<p className="text-gray-500 text-sm mb-4">You don't have any upcoming bookings.</p>
								<Button asChild>
									<a href="/services">Book a Service</a>
								</Button>
							</div>
						</div>
					) : (
						<div className={cn(
							isMobile ? "" : "grid gap-4"
						)}>
							{categorizedBookings.upcoming.map((booking) => (
								<BookingCard key={booking.id} booking={booking} />
							))}
							{/* Bottom padding for mobile to ensure last item is visible */}
							{isMobile && (
								<div className="h-20"></div>
							)}
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Booking Details Dialog/Fullscreen */}
			<Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
				<DialogContent
					className={cn(
						"[&>button]:hidden", // Hide default close button
						isMobile ? "max-w-full w-full h-full m-0 rounded-none p-0 bg-gray-50" : "max-w-md bg-gray-50"
					)}
				>
					{selectedBooking && (
						<div className={cn(
							isMobile ? "flex flex-col h-full" : "flex flex-col"
						)}>
							{/* Header */}
							<div className={cn(
								"bg-white border-b px-4 py-3 flex items-center justify-between",
								isMobile ? "" : "rounded-t-lg"
							)}>
								<DialogHeader className="flex-1">
									<DialogTitle className="text-left">Trip Details</DialogTitle>
								</DialogHeader>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setBookingDetailsOpen(false)}
									className="h-8 w-8 p-0"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Content */}
							<div className={cn(
								"flex-1 p-4 space-y-4",
								isMobile ? "overflow-y-auto" : ""
							)}>
								{/* Status and Time */}
								<div className="bg-white rounded-lg p-4 border">
									<div className="flex items-center justify-between mb-3">
										<h3 className="font-semibold text-gray-900">Booking Status</h3>
										<Badge
											variant={selectedBooking.status === 'completed' ? 'default' :
												selectedBooking.status === 'cancelled' ? 'destructive' :
												selectedBooking.status === 'confirmed' ? 'secondary' : 'outline'}
										>
											{selectedBooking.status.replace('_', ' ').toUpperCase()}
										</Badge>
									</div>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<p className="text-gray-500 mb-1">Date</p>
											<p className="font-medium">{format(new Date(selectedBooking.scheduledPickupTime), "MMM dd, yyyy")}</p>
										</div>
										<div>
											<p className="text-gray-500 mb-1">Time</p>
											<p className="font-medium">{format(new Date(selectedBooking.scheduledPickupTime), "HH:mm")}</p>
										</div>
									</div>
								</div>

								{/* Route Details */}
								<div className="bg-white rounded-lg p-4 border">
									<h3 className="font-semibold text-gray-900 mb-3">Route</h3>
									<div className="space-y-3">
										<div className="flex items-start gap-3">
											<div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
											<div>
												<p className="font-medium text-sm">Pickup</p>
												<p className="text-sm text-gray-600">{selectedBooking.originAddress || selectedBooking.pickupAddress}</p>
											</div>
										</div>
										{selectedBooking.stops && selectedBooking.stops.length > 0 && selectedBooking.stops.map((stop: any, index: number) => (
											<div key={stop.id || index} className="flex items-start gap-3">
												<div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
												<div>
													<p className="font-medium text-sm">Stop {index + 1}</p>
													<p className="text-sm text-gray-600">{stop.address}</p>
												</div>
											</div>
										))}
										{selectedBooking.destinationAddress && (
											<div className="flex items-start gap-3">
												<div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
												<div>
													<p className="font-medium text-sm">Drop-off</p>
													<p className="text-sm text-gray-600">{selectedBooking.destinationAddress}</p>
												</div>
											</div>
										)}
									</div>
								</div>

								{/* Pricing */}
								<div className="bg-white rounded-lg p-4 border">
									<h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
									<div className="flex items-center justify-between">
										<span className="text-lg font-bold">{formatPrice(selectedBooking.amount || 0)}</span>
										<span className="text-sm text-gray-500">
											{selectedBooking.bookingType === 'package' ? 'Service Package' : 'Custom Booking'}
										</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}