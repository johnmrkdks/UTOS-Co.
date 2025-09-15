import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
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
	ChevronRight,
	Info,
	Edit3,
	XCircle,
	MessageSquare,
} from "lucide-react";
import { useUnifiedUserBookingsQuery } from "@/hooks/query/use-unified-user-bookings-query";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useMemo, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { BookingActions } from "@/features/customer/_components/booking-actions";
import { EditCancelDialogs } from "@/features/customer/_components/edit-cancel-dialogs";
import { format } from "date-fns";

// Helper functions for booking validation
const canEditBooking = (booking: any): boolean => {
	if (!booking?.scheduledPickupTime) return false;

	const now = new Date();
	const pickupTime = new Date(booking.scheduledPickupTime);
	const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

	// Can edit if pickup is more than 4 hours away and booking is not started/completed/cancelled
	const isEditableBooking = !['driver_en_route', 'arrived_pickup', 'passenger_on_board', 'in_progress', 'dropped_off', 'completed', 'cancelled', 'no_show'].includes(booking.status);
	return hoursUntilPickup > 4 && isEditableBooking;
};

const canCancelBooking = (booking: any): boolean => {
	if (!booking?.scheduledPickupTime) return false;

	const now = new Date();
	const pickupTime = new Date(booking.scheduledPickupTime);
	const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

	// Can cancel if pickup is more than 4 hours away and booking is not started/completed/cancelled
	const isCancellableBooking = !['driver_en_route', 'arrived_pickup', 'passenger_on_board', 'in_progress', 'dropped_off', 'completed', 'cancelled', 'no_show'].includes(booking.status);
	return hoursUntilPickup > 4 && isCancellableBooking;
};

export function CustomerTripsPage() {
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	const { data: bookingsData, isLoading, error, refetch } = useUnifiedUserBookingsQuery({
		limit: 50,
		offset: 0,
	})

	const bookings = bookingsData?.data || [];
	const [selectedBooking, setSelectedBooking] = useState<any>(null);
	const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
	const [driverInfoOpen, setDriverInfoOpen] = useState(false);
	const [selectedDriverBooking, setSelectedDriverBooking] = useState<any>(null);

	// Edit and Cancel dialog states
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [selectedBookingForAction, setSelectedBookingForAction] = useState<any>(null);

	// Memoize mobile detection to prevent re-evaluation during render
	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}, []);

	const handleViewDetails = (booking: any) => {
		setSelectedBooking(booking);
		setBookingDetailsOpen(true);
	};

	const handleViewDriverInfo = (booking: any) => {
		setSelectedDriverBooking(booking);
		setDriverInfoOpen(true);
	};

	const handleEditBooking = (booking: any) => {
		setSelectedBookingForAction(booking);
		setEditDialogOpen(true);
	};

	const handleCancelBooking = (booking: any) => {
		setSelectedBookingForAction(booking);
		setCancelDialogOpen(true);
	};

	// Helper functions
	const formatPrice = (price: number) => {
		if (!price) return '$0.00';
		// Check if price is already in dollars or cents
		const amount = price > 1000 ? price / 100 : price;
		return `$${amount.toFixed(2)}`;
	};

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

	// Categorize bookings with proper trip status logic
	const categorizedBookings = useMemo(() => {
		const now = new Date();

		// All non-completed/cancelled trips
		const allTrips = bookings.filter(b =>
			!["completed", "cancelled"].includes(b.status)
		).sort((a, b) => new Date(a.scheduledPickupTime).getTime() - new Date(b.scheduledPickupTime).getTime());

		// On Going trips - only trips where driver has actually started (driver is en route or trip is in progress)
		const onGoingStatuses = ["driver_en_route", "in_progress", "arrived_pickup", "passenger_on_board"];
		const active = bookings.filter(b =>
			onGoingStatuses.includes(b.status)
		).sort((a, b) => new Date(a.scheduledPickupTime).getTime() - new Date(b.scheduledPickupTime).getTime());

		// Upcoming trips - all future trips and confirmed/assigned trips that haven't started yet
		const upcoming = bookings.filter(b => {
			const isConfirmedOrAssigned = ["pending", "confirmed", "driver_assigned"].includes(b.status);
			const isNotOnGoing = !onGoingStatuses.includes(b.status);
			return isConfirmedOrAssigned && isNotOnGoing;
		}).sort((a, b) => new Date(a.scheduledPickupTime).getTime() - new Date(b.scheduledPickupTime).getTime());

		return {
			all: allTrips,
			active,
			upcoming
		};
	}, [bookings]);

	// State for active tab (reordered: On Going, Upcoming, All)
	const [activeTab, setActiveTab] = useState("active");

	// Simple stats for trip overview
	const tripStats = {
		activeTrips: categorizedBookings.active.length, // On Going trips (driver has started)
		confirmedTrips: categorizedBookings.upcoming.filter(b => ['confirmed', 'driver_assigned'].includes(b.status)).length, // Upcoming confirmed trips
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
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold text-gray-900">
											{format(new Date(booking.scheduledPickupTime), "h:mm a")}
										</span>
										<span className="text-xs text-gray-400 font-mono">
											#{booking.id.slice(-6)}
										</span>
									</div>
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
						<div className="space-y-1 mb-2 flex items-center justify-between">
							<div className="flex flex-col items-start gap-2">
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
									<div className="flex items-center gap-2 justify-between">
										<div className="flex items-center gap-2 flex-1">
											<div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
											<p className="text-xs text-gray-700 truncate max-w-[200px]">
												{booking.destinationAddress?.length > 35
													? booking.destinationAddress?.substring(0, 35) + '...'
													: booking.destinationAddress}
											</p>
										</div>
										{/* Arrow icon at the end of route info */}
									</div>
								)}
							</div>
							<ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
						</div>

						{/* Price and Actions */}
						<div className="flex items-center justify-between pt-2 border-t">
							<div className="flex items-center gap-1.5">
								<span className="text-sm font-semibold text-gray-900">{formatPrice(booking.amount || booking.quotedAmount || booking.totalAmount || 0)}</span>
							</div>
							{/* 3-Dot Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0"
										onClick={(e) => e.stopPropagation()}
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-48">
									{/* Driver Info */}
									{booking?.driver && (
										<>
											<DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDriverInfo(booking); }}>
												<Car className="h-4 w-4 mr-2" />
												Driver Info
											</DropdownMenuItem>
											<DropdownMenuSeparator />
										</>
									)}

									{/* Edit Booking */}
									{canEditBooking(booking) && (
										<DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditBooking(booking); }}>
											<Edit3 className="h-4 w-4 mr-2" />
											Edit Booking
										</DropdownMenuItem>
									)}

									{/* Cancel Booking */}
									{canCancelBooking(booking) && (
										<DropdownMenuItem
											onClick={(e) => { e.stopPropagation(); handleCancelBooking(booking); }}
											className="text-red-600 focus:text-red-600"
										>
											<XCircle className="h-4 w-4 mr-2" />
											Cancel Booking
										</DropdownMenuItem>
									)}

									{/* No actions available */}
									{!canEditBooking(booking) && !canCancelBooking(booking) && (
										<DropdownMenuItem disabled>
											<Info className="h-4 w-4 mr-2" />
											{['completed', 'cancelled', 'no_show'].includes(booking.status)
												? 'Trip already completed'
												: ['driver_en_route', 'arrived_pickup', 'passenger_on_board', 'in_progress', 'dropped_off'].includes(booking.status)
													? 'Trip already in progress'
													: 'Too close to pickup time (4hr limit)'
											}
										</DropdownMenuItem>
									)}
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
									<div className="flex items-center gap-2">
										<span className="font-semibold text-gray-900">
											{format(new Date(booking.scheduledPickupTime), "h:mm a")}
										</span>
										<span className="text-xs text-gray-400 font-mono">
											#{booking.id.slice(-6)}
										</span>
									</div>
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
								<div className="flex items-start gap-2 justify-between">
									<div className="flex items-start gap-2 flex-1">
										<div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
										<div className="flex-1 min-w-0">
											<p className="text-sm text-gray-900 truncate">{booking.destinationAddress}</p>
										</div>
									</div>
									{/* Arrow icon at the end of route info */}
									<ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
								</div>
							)}
						</div>

						{/* Price and Actions */}
						<div className="flex items-center justify-between pt-2 border-t">
							<div className="flex items-center gap-1">
								<DollarSign className="h-4 w-4 text-gray-500" />
								<span className="font-semibold text-base">{formatPrice(booking.amount || booking.quotedAmount || booking.totalAmount || 0)}</span>
							</div>
							{/* 3-Dot Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0"
										onClick={(e) => e.stopPropagation()}
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-48">
									{/* Driver Info */}
									{booking?.driver && (
										<>
											<DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDriverInfo(booking); }}>
												<Car className="h-4 w-4 mr-2" />
												Driver Info
											</DropdownMenuItem>
											<DropdownMenuSeparator />
										</>
									)}

									{/* Edit Booking */}
									{canEditBooking(booking) && (
										<DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditBooking(booking); }}>
											<Edit3 className="h-4 w-4 mr-2" />
											Edit Booking
										</DropdownMenuItem>
									)}

									{/* Cancel Booking */}
									{canCancelBooking(booking) && (
										<DropdownMenuItem
											onClick={(e) => { e.stopPropagation(); handleCancelBooking(booking); }}
											className="text-red-600 focus:text-red-600"
										>
											<XCircle className="h-4 w-4 mr-2" />
											Cancel Booking
										</DropdownMenuItem>
									)}

									{/* No actions available */}
									{!canEditBooking(booking) && !canCancelBooking(booking) && (
										<DropdownMenuItem disabled>
											<Info className="h-4 w-4 mr-2" />
											{['completed', 'cancelled', 'no_show'].includes(booking.status)
												? 'Trip already completed'
												: ['driver_en_route', 'arrived_pickup', 'passenger_on_board', 'in_progress', 'dropped_off'].includes(booking.status)
													? 'Trip already in progress'
													: 'Too close to pickup time (4hr limit)'
											}
										</DropdownMenuItem>
									)}
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

			{/* Tabs - Driver History Style Implementation */}
			<div className={cn(isMobile ? "flex-1 overflow-y-auto" : "")}>
				{isMobile ? (
					// Mobile: Custom tab design matching driver history
					<>
						{/* Mobile Tab Headers - Reordered: On Going, Upcoming, All */}
						<div className="bg-white border-b border-gray-200 sticky top-0 z-20">
							<div className="flex w-full">
								<button
									onClick={() => setActiveTab("active")}
									className={cn(
										"flex-1 py-3 px-1 text-xs font-medium text-center border-b-2 transition-all duration-200 min-w-0",
										activeTab === "active"
											? "border-primary text-primary bg-primary/5"
											: "border-transparent text-gray-600 hover:text-gray-900"
									)}
								>
									<span className="truncate">On Going ({categorizedBookings.active.length})</span>
								</button>
								<button
									onClick={() => setActiveTab("upcoming")}
									className={cn(
										"flex-1 py-3 px-1 text-xs font-medium text-center border-b-2 transition-all duration-200 min-w-0",
										activeTab === "upcoming"
											? "border-primary text-primary bg-primary/5"
											: "border-transparent text-gray-600 hover:text-gray-900"
									)}
								>
									<span className="truncate">Upcoming ({categorizedBookings.upcoming.length})</span>
								</button>
								<button
									onClick={() => setActiveTab("all")}
									className={cn(
										"flex-1 py-3 px-1 text-xs font-medium text-center border-b-2 transition-all duration-200 min-w-0",
										activeTab === "all"
											? "border-primary text-primary bg-primary/5"
											: "border-transparent text-gray-600 hover:text-gray-900"
									)}
								>
									<span className="truncate">All ({categorizedBookings.all.length})</span>
								</button>
							</div>
						</div>

						{/* Mobile Tab Content - Reordered: On Going, Upcoming, All */}
						<div className="flex-1">
							{activeTab === "active" && (
								<div className={cn(isMobile ? "" : "grid gap-4")}>
									{categorizedBookings.active.length === 0 ? (
										<div className="flex items-center justify-center py-12 px-4">
											<div className="text-center">
												<Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
												<h3 className="text-lg font-medium text-gray-900 mb-2">No ongoing trips</h3>
												<p className="text-gray-500 text-sm">You don't have any trips in progress.</p>
											</div>
										</div>
									) : (
										<>
											{categorizedBookings.active.map((booking) => (
												<BookingCard key={booking.id} booking={booking} />
											))}
											{/* Bottom padding for mobile */}
											<div className="h-20"></div>
										</>
									)}
								</div>
							)}

							{activeTab === "upcoming" && (
								<div className={cn(isMobile ? "" : "grid gap-4")}>
									{categorizedBookings.upcoming.length === 0 ? (
										<div className="flex items-center justify-center py-12 px-4">
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
										<>
											{categorizedBookings.upcoming.map((booking) => (
												<BookingCard key={booking.id} booking={booking} />
											))}
											{/* Bottom padding for mobile */}
											<div className="h-20"></div>
										</>
									)}
								</div>
							)}

							{activeTab === "all" && (
								<div className={cn(isMobile ? "" : "grid gap-4")}>
									{categorizedBookings.all.length === 0 ? (
										<div className="flex items-center justify-center py-12 px-4">
											<div className="text-center">
												<Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
												<h3 className="text-lg font-medium text-gray-900 mb-2">No trips</h3>
												<p className="text-gray-500 text-sm">You don't have any trips yet.</p>
											</div>
										</div>
									) : (
										<>
											{categorizedBookings.all.map((booking) => (
												<BookingCard key={booking.id} booking={booking} />
											))}
											{/* Bottom padding for mobile */}
											<div className="h-20"></div>
										</>
									)}
								</div>
							)}
						</div>
					</>
				) : (
					// Desktop: Use shadcn Tabs component - Reordered: On Going, Upcoming, All
					<Tabs defaultValue="active" className="w-full">
						<TabsList className="grid w-full grid-cols-3 h-12">
							<TabsTrigger value="active">On Going ({categorizedBookings.active.length})</TabsTrigger>
							<TabsTrigger value="upcoming">Upcoming ({categorizedBookings.upcoming.length})</TabsTrigger>
							<TabsTrigger value="all">All Trips ({categorizedBookings.all.length})</TabsTrigger>
						</TabsList>

						<TabsContent value="active" className="mt-6">
							<div className="grid gap-4">
								{categorizedBookings.active.length === 0 ? (
									<div className="flex items-center justify-center py-12">
										<div className="text-center">
											<Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
											<h3 className="text-lg font-medium text-gray-900 mb-2">No ongoing trips</h3>
											<p className="text-gray-500 text-sm">You don't have any trips in progress.</p>
										</div>
									</div>
								) : (
									categorizedBookings.active.map((booking) => (
										<BookingCard key={booking.id} booking={booking} />
									))
								)}
							</div>
						</TabsContent>

						<TabsContent value="upcoming" className="mt-6">
							<div className="grid gap-4">
								{categorizedBookings.upcoming.length === 0 ? (
									<div className="flex items-center justify-center py-12">
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
									categorizedBookings.upcoming.map((booking) => (
										<BookingCard key={booking.id} booking={booking} />
									))
								)}
							</div>
						</TabsContent>

						<TabsContent value="all" className="mt-6">
							<div className="grid gap-4">
								{categorizedBookings.all.length === 0 ? (
									<div className="flex items-center justify-center py-12">
										<div className="text-center">
											<Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
											<h3 className="text-lg font-medium text-gray-900 mb-2">No trips</h3>
											<p className="text-gray-500 text-sm">You don't have any trips yet.</p>
										</div>
									</div>
								) : (
									categorizedBookings.all.map((booking) => (
										<BookingCard key={booking.id} booking={booking} />
									))
								)}
							</div>
						</TabsContent>
					</Tabs>
				)}
			</div>

			{/* Booking Details Dialog/Fullscreen */}
			<Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
				<DialogContent
					className={cn(
						"[&>button]:hidden", // Hide default close button
						isMobile ? "max-w-full w-full h-full m-0 rounded-none p-0 bg-gray-50 flex flex-col" : "max-w-lg w-full bg-gray-50"
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
									<DialogTitle className="text-left flex items-center gap-2">
										Trip Details
										<span className="text-xs text-gray-400 font-mono">
											#{selectedBooking.id.slice(-6)}
										</span>
									</DialogTitle>
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
								isMobile ? "overflow-y-auto flex-grow min-h-0" : ""
							)}>
								{/* Status and Time - Minimal */}
								<div className="bg-white rounded-lg p-3 border">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-gray-500" />
											<div>
												<p className="text-sm font-medium">{format(new Date(selectedBooking.scheduledPickupTime), "MMM dd, yyyy")}</p>
												<p className="text-xs text-gray-500">{format(new Date(selectedBooking.scheduledPickupTime), "h:mm a")}</p>
											</div>
										</div>
										<Badge
											variant={selectedBooking.status === 'completed' ? 'default' :
												selectedBooking.status === 'cancelled' ? 'destructive' :
													selectedBooking.status === 'confirmed' ? 'secondary' : 'outline'}
											className="text-xs"
										>
											{selectedBooking.status.replace('_', ' ').toUpperCase()}
										</Badge>
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
												<p className="text-xs text-gray-600">{selectedBooking.originAddress || selectedBooking.pickupAddress}</p>
											</div>
										</div>
										{selectedBooking.stops && selectedBooking.stops.length > 0 && selectedBooking.stops.map((stop: any, index: number) => (
											<div key={stop.id || index} className="flex items-start gap-3">
												<div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
												<div>
													<p className="font-medium text-sm">Stop {index + 1}</p>
													<p className="text-xs text-gray-600">{stop.address}</p>
												</div>
											</div>
										))}
										{selectedBooking.destinationAddress && (
											<div className="flex items-start gap-3">
												<div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
												<div>
													<p className="font-medium text-sm">Drop-off</p>
													<p className="text-xs text-gray-600">{selectedBooking.destinationAddress}</p>
												</div>
											</div>
										)}
									</div>
								</div>

								{/* Driver Information */}
								{(selectedBooking.driver || selectedBooking.driverId ||
									['driver_assigned', 'driver_en_route', 'in_progress', 'arrived_pickup', 'passenger_on_board', 'completed'].includes(selectedBooking.status)) && (
										<div className="bg-white rounded-lg p-4 border">
											<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
												<Car className="h-5 w-5" />
												Assigned Vehicle
											</h3>
											<div className="space-y-3">
												{/* Vehicle Info */}
												<div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
													<Car className="h-8 w-8 text-blue-600" />
													<div>
														<p className="font-medium text-sm">
															{selectedBooking.driver?.car?.name ||
																selectedBooking.car?.name ||
																'Test Car 1'}
														</p>
														<p className="text-xs text-gray-600">Assigned Vehicle</p>
													</div>
												</div>

												{/* Driver Contact */}
												<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
													<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
														<UserIcon className="h-5 w-5 text-gray-500" />
													</div>
													<div className="flex-1">
														<p className="font-medium text-sm">
															{selectedBooking.driver?.user?.name ||
																selectedBooking.driver?.name ||
																selectedBooking.driverName ||
																'Ivan Gemota'}
														</p>
														<p className="text-xs text-gray-600">
															{selectedBooking.driver?.phoneNumber ||
																selectedBooking.driver?.user?.phoneNumber ||
																selectedBooking.driverPhone ||
																'Contact info not available'}
														</p>
													</div>
													<div className="flex gap-2">
														<Button
															size="sm"
															variant="outline"
															className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300"
															onClick={(e) => {
																e.stopPropagation();
																const phone = selectedBooking.driver?.phoneNumber || selectedBooking.driver?.user?.phoneNumber || selectedBooking.driverPhone;
																if (phone && phone !== 'Contact info not available') {
																	window.location.href = `tel:${phone}`;
																}
															}}
															disabled={!selectedBooking.driver?.phoneNumber && !selectedBooking.driver?.user?.phoneNumber && !selectedBooking.driverPhone}
														>
															<Phone className="h-3.5 w-3.5 text-green-600" />
														</Button>
														<Button
															size="sm"
															variant="outline"
															className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
															onClick={(e) => {
																e.stopPropagation();
																const phone = selectedBooking.driver?.phoneNumber || selectedBooking.driver?.user?.phoneNumber || selectedBooking.driverPhone;
																if (phone && phone !== 'Contact info not available') {
																	window.location.href = `sms:${phone}`;
																}
															}}
															disabled={!selectedBooking.driver?.phoneNumber && !selectedBooking.driver?.user?.phoneNumber && !selectedBooking.driverPhone}
														>
															<MessageSquare className="h-3.5 w-3.5 text-blue-600" />
														</Button>
													</div>
												</div>
											</div>
										</div>
									)}

								{/* Pricing */}
								<div className="bg-white rounded-lg p-4 border">
									<h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
									<div className="flex items-center justify-between">
										<span className="text-lg font-bold">{formatPrice(selectedBooking.amount || selectedBooking.quotedAmount || selectedBooking.totalAmount || 0)}</span>
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

			{/* Driver Info Dialog/Fullscreen */}
			<Dialog open={driverInfoOpen} onOpenChange={setDriverInfoOpen}>
				<DialogContent
					className={cn(
						"[&>button]:hidden", // Hide default close button
						isMobile ? "max-w-full w-full h-full m-0 rounded-none p-0 bg-gray-50 flex flex-col" : "max-w-lg w-full bg-gray-50"
					)}
				>
					{selectedDriverBooking && (selectedDriverBooking.driver || selectedDriverBooking.assignedDriver) && (
						<div className={cn(
							isMobile ? "flex flex-col h-full" : "flex flex-col"
						)}>
							{/* Header */}
							<div className={cn(
								"bg-white border-b px-4 py-3 flex items-center justify-between",
								isMobile ? "" : "rounded-t-lg"
							)}>
								<DialogHeader className="flex-1">
									<DialogTitle className="text-left flex items-center gap-2">
										<Car className="h-5 w-5" />
										Driver Information
									</DialogTitle>
								</DialogHeader>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setDriverInfoOpen(false)}
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
								{/* Driver Details */}
								<div className="bg-white rounded-lg p-4 border">
									<h3 className="font-semibold text-gray-900 mb-3">Driver Details</h3>
									<div className="flex items-center gap-3 mb-4">
										{(selectedDriverBooking.driver?.user?.image || selectedDriverBooking.assignedDriver?.user?.image) ? (
											<img
												src={selectedDriverBooking.driver?.user?.image || selectedDriverBooking.assignedDriver?.user?.image}
												alt={selectedDriverBooking.driver?.user?.name || selectedDriverBooking.assignedDriver?.user?.name}
												className="h-12 w-12 rounded-full object-cover"
											/>
										) : (
											<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
												<Users className="h-6 w-6 text-primary" />
											</div>
										)}
										<div className="flex-1">
											<h4 className="font-semibold text-lg">
												{selectedDriverBooking.driver?.user?.name ||
												 selectedDriverBooking.driver?.name ||
												 selectedDriverBooking.assignedDriver?.user?.name ||
												 selectedDriverBooking.driverName ||
												 'Driver'}
											</h4>
											<p className="text-sm text-gray-600">Professional Driver</p>
										</div>
									</div>

									{/* Contact Information */}
									<div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
										<div>
											<p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</p>
											<p className="text-sm font-medium flex items-center gap-1">
												<Phone className="h-3 w-3" />
												{selectedDriverBooking.driver?.phoneNumber ||
												 selectedDriverBooking.driver?.user?.phoneNumber ||
												 selectedDriverBooking.assignedDriver?.phoneNumber ||
												 selectedDriverBooking.driverPhone ||
												 "Not provided"}
											</p>
										</div>
										<div>
											<p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">License</p>
											<p className="text-sm font-medium">
												{selectedDriverBooking.driver?.licenseNumber ||
												 selectedDriverBooking.assignedDriver?.licenseNumber ||
												 "N/A"}
											</p>
										</div>
									</div>
								</div>

								{/* Vehicle Information */}
								{(selectedDriverBooking.driver?.car || selectedDriverBooking.assignedDriver?.car || selectedDriverBooking.car) && (
									<div className="bg-white rounded-lg p-4 border">
										<h3 className="font-semibold text-gray-900 mb-3">Vehicle Information</h3>
										<div className="space-y-3">
											<div className="flex justify-between">
												<span className="text-sm text-gray-500">Vehicle:</span>
												<span className="text-sm font-medium">
													{selectedDriverBooking.driver?.car?.name ||
													 selectedDriverBooking.assignedDriver?.car?.name ||
													 selectedDriverBooking.car?.name ||
													 'Vehicle information unavailable'}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-gray-500">Plate:</span>
												<span className="text-sm font-medium">
													{selectedDriverBooking.driver?.car?.licensePlate ||
													 selectedDriverBooking.assignedDriver?.car?.licensePlate ||
													 selectedDriverBooking.car?.licensePlate ||
													 'N/A'}
												</span>
											</div>
											{(selectedDriverBooking.driver?.car?.color || selectedDriverBooking.assignedDriver?.car?.color || selectedDriverBooking.car?.color) && (
												<div className="flex justify-between">
													<span className="text-sm text-gray-500">Color:</span>
													<span className="text-sm font-medium">
														{selectedDriverBooking.driver?.car?.color ||
														 selectedDriverBooking.assignedDriver?.car?.color ||
														 selectedDriverBooking.car?.color}
													</span>
												</div>
											)}
										</div>
									</div>
								)}

								{/* Action Buttons */}
								<div className={cn(
									"flex gap-2 pt-4",
									isMobile ? "pb-4" : ""
								)}>
									{(() => {
										const phoneNumber = selectedDriverBooking.driver?.phoneNumber ||
														   selectedDriverBooking.driver?.user?.phoneNumber ||
														   selectedDriverBooking.assignedDriver?.phoneNumber ||
														   selectedDriverBooking.driverPhone;

										return phoneNumber && phoneNumber !== "Not provided" ? (
											<>
												<Button
													onClick={(e) => {
														e.stopPropagation();
														window.location.href = `tel:${phoneNumber}`;
													}}
													className="flex-1 h-12"
												>
													<Phone className="h-4 w-4 mr-2" />
													Call Driver
												</Button>
												<Button
													onClick={(e) => {
														e.stopPropagation();
														window.location.href = `sms:${phoneNumber}`;
													}}
													variant="outline"
													className="flex-1 h-12"
												>
													<MessageSquare className="h-4 w-4 mr-2" />
													Message
												</Button>
											</>
										) : (
											<div className="w-full text-center py-4 text-sm text-gray-500">
												Contact information not available
											</div>
										);
									})()}
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Edit and Cancel Dialogs */}
			{selectedBookingForAction && (
				<EditCancelDialogs
					booking={selectedBookingForAction}
					isEditOpen={editDialogOpen}
					isCancelOpen={cancelDialogOpen}
					onEditOpenChange={setEditDialogOpen}
					onCancelOpenChange={setCancelDialogOpen}
				/>
			)}
		</div>
	);
}
