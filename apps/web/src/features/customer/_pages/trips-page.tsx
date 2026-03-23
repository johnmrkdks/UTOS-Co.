import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import {
	ActivityIcon,
	AlertTriangle,
	Calendar,
	Car,
	CheckCircle,
	ChevronRight,
	CircleDot,
	Clock,
	DollarSign,
	Edit3,
	Info,
	Loader2,
	MapPin,
	MessageSquare,
	MoreVertical,
	Package,
	Phone,
	RefreshCwIcon,
	UserIcon,
	Users,
	X,
	XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BookingTypeBadge } from "@/components/booking-type-badge";
import { BookingActions } from "@/features/customer/_components/booking-actions";
import { EditCancelDialogs } from "@/features/customer/_components/edit-cancel-dialogs";
import { useUnifiedUserBookingsQuery } from "@/hooks/query/use-unified-user-bookings-query";
import { useUserQuery } from "@/hooks/query/use-user-query";

// Helper functions for booking validation
const canEditBooking = (booking: any): boolean => {
	if (!booking?.scheduledPickupTime) return false;

	const now = new Date();
	const pickupTime = new Date(booking.scheduledPickupTime);
	const hoursUntilPickup =
		(pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

	// Can edit if pickup is more than 4 hours away and booking is not started/completed/cancelled
	const isEditableBooking = ![
		"driver_en_route",
		"arrived_pickup",
		"passenger_on_board",
		"in_progress",
		"dropped_off",
		"completed",
		"cancelled",
		"no_show",
	].includes(booking.status);
	return hoursUntilPickup > 4 && isEditableBooking;
};

const canCancelBooking = (booking: any): boolean => {
	if (!booking?.scheduledPickupTime) return false;

	const now = new Date();
	const pickupTime = new Date(booking.scheduledPickupTime);
	const hoursUntilPickup =
		(pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

	// Can cancel if pickup is more than 4 hours away and booking is not started/completed/cancelled
	const isCancellableBooking = ![
		"driver_en_route",
		"arrived_pickup",
		"passenger_on_board",
		"in_progress",
		"dropped_off",
		"completed",
		"cancelled",
		"no_show",
	].includes(booking.status);
	return hoursUntilPickup > 4 && isCancellableBooking;
};

export function CustomerTripsPage() {
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	const {
		data: bookingsData,
		isLoading,
		error,
		refetch,
	} = useUnifiedUserBookingsQuery({
		limit: 50,
		offset: 0,
	});

	const bookings = bookingsData?.data || [];
	const [selectedBooking, setSelectedBooking] = useState<any>(null);
	const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
	const [driverInfoOpen, setDriverInfoOpen] = useState(false);
	const [selectedDriverBooking, setSelectedDriverBooking] = useState<any>(null);

	// Edit and Cancel dialog states
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [selectedBookingForAction, setSelectedBookingForAction] =
		useState<any>(null);

	// Memoize mobile detection to prevent re-evaluation during render
	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		);
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
		if (!price) return "$0.00";
		// Price is already in dollars, no conversion needed
		return `$${price.toFixed(2)}`;
	};

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

	// Categorize bookings with proper trip status logic
	const categorizedBookings = useMemo(() => {
		const now = new Date();

		// All non-completed/cancelled trips
		const allTrips = bookings
			.filter((b) => !["completed", "cancelled"].includes(b.status))
			.sort(
				(a, b) =>
					new Date(a.scheduledPickupTime).getTime() -
					new Date(b.scheduledPickupTime).getTime(),
			);

		// On Going trips - only trips where driver has actually started (driver is en route or trip is in progress)
		const onGoingStatuses = [
			"driver_en_route",
			"in_progress",
			"arrived_pickup",
			"passenger_on_board",
		];
		const active = bookings
			.filter((b) => onGoingStatuses.includes(b.status))
			.sort(
				(a, b) =>
					new Date(a.scheduledPickupTime).getTime() -
					new Date(b.scheduledPickupTime).getTime(),
			);

		// Upcoming trips - all future trips and confirmed/assigned trips that haven't started yet
		const upcoming = bookings
			.filter((b) => {
				const isConfirmedOrAssigned = [
					"pending",
					"confirmed",
					"driver_assigned",
				].includes(b.status);
				const isNotOnGoing = !onGoingStatuses.includes(b.status);
				return isConfirmedOrAssigned && isNotOnGoing;
			})
			.sort(
				(a, b) =>
					new Date(a.scheduledPickupTime).getTime() -
					new Date(b.scheduledPickupTime).getTime(),
			);

		return {
			all: allTrips,
			active,
			upcoming,
		};
	}, [bookings]);

	// State for active tab (reordered: On Going, Upcoming, All)
	const [activeTab, setActiveTab] = useState("active");

	// Simple stats for trip overview
	const tripStats = {
		activeTrips: categorizedBookings.active.length, // On Going trips (driver has started)
		confirmedTrips: categorizedBookings.upcoming.filter((b) =>
			["confirmed", "driver_assigned"].includes(b.status),
		).length, // Upcoming confirmed trips
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 w-1/3 rounded bg-gray-200" />
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-24 rounded bg-gray-200" />
						))}
					</div>
				</div>
			</div>
		);
	}

	// Status-based color coding function
	const getStatusStyle = (status: string) => {
		const baseStyle = {
			borderLeftWidth: "4px",
			borderLeftStyle: "solid" as const,
		};

		switch (status) {
			case "confirmed":
				return { ...baseStyle, borderLeftColor: "#3b82f6" }; // Blue
			case "driver_assigned":
				return { ...baseStyle, borderLeftColor: "#eab308" }; // Yellow
			case "driver_en_route":
			case "in_progress":
				return { ...baseStyle, borderLeftColor: "#22c55e" }; // Green
			case "arrived_pickup":
			case "passenger_on_board":
				return { ...baseStyle, borderLeftColor: "#f97316" }; // Orange
			case "completed":
				return { ...baseStyle, borderLeftColor: "#6b7280" }; // Gray
			case "cancelled":
				return { ...baseStyle, borderLeftColor: "#ef4444" }; // Red
			default:
				return { ...baseStyle, borderLeftColor: "#d1d5db" }; // Light gray
		}
	};

	const BookingCard = ({ booking }: { booking: any }) => (
		<Card
			key={booking.id}
			style={getStatusStyle(booking.status)}
			className={cn(
				"cursor-pointer bg-white transition-colors active:bg-gray-50",
				isMobile
					? "rounded-none border-gray-200 border-t-0 border-r-0 border-b shadow-none"
					: "border-gray-200 border-t border-r border-b shadow-sm hover:shadow-md",
			)}
			onClick={() => handleViewDetails(booking)}
		>
			<CardContent className={cn(isMobile ? "px-3 py-2.5" : "p-4")}>
				{isMobile ? (
					// Mobile optimized layout - similar to driver interface
					<>
						{/* Header - Time and Status */}
						<div className="mb-2 flex items-center justify-between">
							<div className="flex items-center gap-1.5">
								<Clock className="h-3.5 w-3.5 text-gray-500" />
								<div className="flex flex-col">
									<div className="flex items-center gap-2">
										<span className="font-semibold text-gray-900 text-sm">
											{format(new Date(booking.scheduledPickupTime), "h:mm a")}
										</span>
										<span className="font-mono text-gray-400 text-xs">
											#{(booking as any).referenceNumber || "N/A"}
										</span>
									</div>
									<span className="text-gray-500 text-xs">
										{format(
											new Date(booking.scheduledPickupTime),
											"MMM dd, yyyy",
										)}
									</span>
								</div>
							</div>
							<div className="flex gap-1">
								<BookingTypeBadge booking={booking} />
								<Badge
									variant={
										booking.status === "completed"
											? "default"
											: booking.status === "cancelled"
												? "destructive"
												: booking.status === "confirmed"
													? "secondary"
													: "outline"
									}
									className="px-2 py-0.5 text-xs"
								>
									{booking.status.replace("_", " ").toUpperCase()}
								</Badge>
							</div>
						</div>

						{/* Route - Mobile optimized */}
						<div className="mb-2 flex items-center justify-between space-y-1">
							<div className="flex flex-col items-start gap-2">
								<div className="flex items-center gap-2">
									<div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
									<p className="max-w-[200px] flex-1 truncate text-gray-700 text-xs">
										{(booking.originAddress || booking.pickupAddress)?.length >
										35
											? (
													booking.originAddress || booking.pickupAddress
												)?.substring(0, 35) + "..."
											: booking.originAddress || booking.pickupAddress}
									</p>
								</div>
								{/* Stops (if any) */}
								{booking.stops && booking.stops.length > 0 && (
									<div className="flex items-center gap-2">
										<div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
										<p className="max-w-[200px] flex-1 truncate text-blue-600 text-xs">
											{booking.stops.length} stop
											{booking.stops.length > 1 ? "s" : ""}
										</p>
									</div>
								)}
								{booking.destinationAddress && (
									<div className="flex items-center justify-between gap-2">
										<div className="flex flex-1 items-center gap-2">
											<div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
											<p className="max-w-[200px] truncate text-gray-700 text-xs">
												{booking.destinationAddress?.length > 35
													? booking.destinationAddress?.substring(0, 35) + "..."
													: booking.destinationAddress}
											</p>
										</div>
										{/* Arrow icon at the end of route info */}
									</div>
								)}
							</div>
							<ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
						</div>

						{/* Price and Actions */}
						<div className="flex items-center justify-between border-t pt-2">
							<div className="flex items-center gap-1.5">
								<span className="font-semibold text-gray-900 text-sm">
									{formatPrice(
										booking.amount ||
											booking.quotedAmount ||
											booking.totalAmount ||
											0,
									)}
								</span>
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
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													handleViewDriverInfo(booking);
												}}
											>
												<Car className="mr-2 h-4 w-4" />
												Driver Info
											</DropdownMenuItem>
											<DropdownMenuSeparator />
										</>
									)}

									{/* Edit Booking */}
									{canEditBooking(booking) && (
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												handleEditBooking(booking);
											}}
										>
											<Edit3 className="mr-2 h-4 w-4" />
											Edit Booking
										</DropdownMenuItem>
									)}

									{/* Cancel Booking */}
									{canCancelBooking(booking) && (
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												handleCancelBooking(booking);
											}}
											className="text-red-600 focus:text-red-600"
										>
											<XCircle className="mr-2 h-4 w-4" />
											Cancel Booking
										</DropdownMenuItem>
									)}

									{/* No actions available */}
									{!canEditBooking(booking) && !canCancelBooking(booking) && (
										<DropdownMenuItem disabled>
											<Info className="mr-2 h-4 w-4" />
											{["completed", "cancelled", "no_show"].includes(
												booking.status,
											)
												? "Trip already completed"
												: [
															"driver_en_route",
															"arrived_pickup",
															"passenger_on_board",
															"in_progress",
															"dropped_off",
														].includes(booking.status)
													? "Trip already in progress"
													: "Too close to pickup time (4hr limit)"}
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
						<div className="mb-2 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-gray-500" />
								<div className="flex flex-col">
									<div className="flex items-center gap-2">
										<span className="font-semibold text-gray-900">
											{format(new Date(booking.scheduledPickupTime), "h:mm a")}
										</span>
										<span className="font-mono text-gray-400 text-xs">
											#{(booking as any).referenceNumber || "N/A"}
										</span>
									</div>
									<span className="text-gray-500 text-xs">
										{format(
											new Date(booking.scheduledPickupTime),
											"MMM dd, yyyy",
										)}
									</span>
								</div>
							</div>
							<div className="flex gap-2">
								<BookingTypeBadge booking={booking} />
								<Badge
									variant={
										booking.status === "completed"
											? "default"
											: booking.status === "cancelled"
												? "destructive"
												: booking.status === "confirmed"
													? "secondary"
													: "outline"
									}
									className="font-medium text-xs"
								>
									{booking.status.replace("_", " ").toUpperCase()}
								</Badge>
							</div>
						</div>

						{/* Route */}
						<div className="mb-2 space-y-1">
							<div className="flex items-start gap-2">
								<div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
								<div className="min-w-0 flex-1">
									<p className="truncate text-gray-900 text-sm">
										{booking.originAddress || booking.pickupAddress}
									</p>
								</div>
							</div>
							{/* Stops (if any) */}
							{booking.stops && booking.stops.length > 0 && (
								<div className="flex items-start gap-2">
									<div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
									<div className="min-w-0 flex-1">
										<p className="truncate text-blue-600 text-sm">
											{booking.stops.length} intermediate stop
											{booking.stops.length > 1 ? "s" : ""}
										</p>
									</div>
								</div>
							)}
							{booking.destinationAddress && (
								<div className="flex items-start justify-between gap-2">
									<div className="flex flex-1 items-start gap-2">
										<div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
										<div className="min-w-0 flex-1">
											<p className="truncate text-gray-900 text-sm">
												{booking.destinationAddress}
											</p>
										</div>
									</div>
									{/* Arrow icon at the end of route info */}
									<ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
								</div>
							)}
						</div>

						{/* Price and Actions */}
						<div className="flex items-center justify-between border-t pt-2">
							<div className="flex items-center gap-1">
								<DollarSign className="h-4 w-4 text-gray-500" />
								<span className="font-semibold text-base">
									{formatPrice(
										booking.amount ||
											booking.quotedAmount ||
											booking.totalAmount ||
											0,
									)}
								</span>
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
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													handleViewDriverInfo(booking);
												}}
											>
												<Car className="mr-2 h-4 w-4" />
												Driver Info
											</DropdownMenuItem>
											<DropdownMenuSeparator />
										</>
									)}

									{/* Edit Booking */}
									{canEditBooking(booking) && (
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												handleEditBooking(booking);
											}}
										>
											<Edit3 className="mr-2 h-4 w-4" />
											Edit Booking
										</DropdownMenuItem>
									)}

									{/* Cancel Booking */}
									{canCancelBooking(booking) && (
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												handleCancelBooking(booking);
											}}
											className="text-red-600 focus:text-red-600"
										>
											<XCircle className="mr-2 h-4 w-4" />
											Cancel Booking
										</DropdownMenuItem>
									)}

									{/* No actions available */}
									{!canEditBooking(booking) && !canCancelBooking(booking) && (
										<DropdownMenuItem disabled>
											<Info className="mr-2 h-4 w-4" />
											{["completed", "cancelled", "no_show"].includes(
												booking.status,
											)
												? "Trip already completed"
												: [
															"driver_en_route",
															"arrived_pickup",
															"passenger_on_board",
															"in_progress",
															"dropped_off",
														].includes(booking.status)
													? "Trip already in progress"
													: "Too close to pickup time (4hr limit)"}
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
		<div
			className={cn(
				isMobile
					? "flex min-h-screen flex-col bg-gray-50"
					: "mx-auto min-h-screen max-w-4xl bg-gray-50 p-4",
			)}
		>
			{/* Header */}
			<div
				className={cn(
					"flex-shrink-0 border-b bg-white",
					isMobile ? "px-4 py-3" : "mb-4 rounded-lg p-4",
				)}
			>
				<div className="flex items-center justify-between">
					<div>
						<h1
							className={cn(
								"font-bold text-gray-900",
								isMobile ? "text-lg" : "text-2xl",
							)}
						>
							My Trips
						</h1>
						<p className="text-gray-600 text-xs">
							Your active and upcoming bookings
						</p>
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
				<div
					className={cn(
						"flex-shrink-0 border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100",
						isMobile ? "mx-0 px-4 py-3" : "mx-4 mb-4 rounded-lg px-4 py-3",
					)}
				>
					<div className="flex items-center gap-3">
						<div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
						<div className="flex-1">
							<h3 className="font-semibold text-blue-900 text-sm">
								{tripStats.activeTrips === 1
									? "1 trip in progress"
									: `${tripStats.activeTrips} trips in progress`}
							</h3>
							<p className="text-blue-700 text-xs">
								{tripStats.confirmedTrips > 0
									? `${tripStats.confirmedTrips} confirmed • `
									: ""}
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
						<div className="sticky top-0 z-20 border-gray-200 border-b bg-white">
							<div className="flex w-full">
								<button
									onClick={() => setActiveTab("active")}
									className={cn(
										"min-w-0 flex-1 border-b-2 px-1 py-3 text-center font-medium text-xs transition-all duration-200",
										activeTab === "active"
											? "border-primary bg-primary/5 text-primary"
											: "border-transparent text-gray-600 hover:text-gray-900",
									)}
								>
									<span className="truncate">
										On Going ({categorizedBookings.active.length})
									</span>
								</button>
								<button
									onClick={() => setActiveTab("upcoming")}
									className={cn(
										"min-w-0 flex-1 border-b-2 px-1 py-3 text-center font-medium text-xs transition-all duration-200",
										activeTab === "upcoming"
											? "border-primary bg-primary/5 text-primary"
											: "border-transparent text-gray-600 hover:text-gray-900",
									)}
								>
									<span className="truncate">
										Upcoming ({categorizedBookings.upcoming.length})
									</span>
								</button>
								<button
									onClick={() => setActiveTab("all")}
									className={cn(
										"min-w-0 flex-1 border-b-2 px-1 py-3 text-center font-medium text-xs transition-all duration-200",
										activeTab === "all"
											? "border-primary bg-primary/5 text-primary"
											: "border-transparent text-gray-600 hover:text-gray-900",
									)}
								>
									<span className="truncate">
										All ({categorizedBookings.all.length})
									</span>
								</button>
							</div>
						</div>

						{/* Mobile Tab Content - Reordered: On Going, Upcoming, All */}
						<div className="flex-1">
							{activeTab === "active" && (
								<div className={cn(isMobile ? "" : "grid gap-4")}>
									{categorizedBookings.active.length === 0 ? (
										<div className="flex items-center justify-center px-4 py-12">
											<div className="text-center">
												<Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
												<h3 className="mb-2 font-medium text-gray-900 text-lg">
													No ongoing trips
												</h3>
												<p className="text-gray-500 text-sm">
													You don't have any trips in progress.
												</p>
											</div>
										</div>
									) : (
										<>
											{categorizedBookings.active.map((booking) => (
												<BookingCard key={booking.id} booking={booking} />
											))}
											{/* Bottom padding for mobile */}
											<div className="h-20" />
										</>
									)}
								</div>
							)}

							{activeTab === "upcoming" && (
								<div className={cn(isMobile ? "" : "grid gap-4")}>
									{categorizedBookings.upcoming.length === 0 ? (
										<div className="flex items-center justify-center px-4 py-12">
											<div className="text-center">
												<Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
												<h3 className="mb-2 font-medium text-gray-900 text-lg">
													No upcoming trips
												</h3>
												<p className="mb-4 text-gray-500 text-sm">
													You don't have any upcoming bookings.
												</p>
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
											<div className="h-20" />
										</>
									)}
								</div>
							)}

							{activeTab === "all" && (
								<div className={cn(isMobile ? "" : "grid gap-4")}>
									{categorizedBookings.all.length === 0 ? (
										<div className="flex items-center justify-center px-4 py-12">
											<div className="text-center">
												<Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
												<h3 className="mb-2 font-medium text-gray-900 text-lg">
													No trips
												</h3>
												<p className="text-gray-500 text-sm">
													You don't have any trips yet.
												</p>
											</div>
										</div>
									) : (
										<>
											{categorizedBookings.all.map((booking) => (
												<BookingCard key={booking.id} booking={booking} />
											))}
											{/* Bottom padding for mobile */}
											<div className="h-20" />
										</>
									)}
								</div>
							)}
						</div>
					</>
				) : (
					// Desktop: Use shadcn Tabs component - Reordered: On Going, Upcoming, All
					<Tabs defaultValue="active" className="w-full">
						<TabsList className="grid h-12 w-full grid-cols-3">
							<TabsTrigger value="active">
								On Going ({categorizedBookings.active.length})
							</TabsTrigger>
							<TabsTrigger value="upcoming">
								Upcoming ({categorizedBookings.upcoming.length})
							</TabsTrigger>
							<TabsTrigger value="all">
								All Trips ({categorizedBookings.all.length})
							</TabsTrigger>
						</TabsList>

						<TabsContent value="active" className="mt-6">
							<div className="grid gap-4">
								{categorizedBookings.active.length === 0 ? (
									<div className="flex items-center justify-center py-12">
										<div className="text-center">
											<Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
											<h3 className="mb-2 font-medium text-gray-900 text-lg">
												No ongoing trips
											</h3>
											<p className="text-gray-500 text-sm">
												You don't have any trips in progress.
											</p>
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
											<Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
											<h3 className="mb-2 font-medium text-gray-900 text-lg">
												No upcoming trips
											</h3>
											<p className="mb-4 text-gray-500 text-sm">
												You don't have any upcoming bookings.
											</p>
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
											<Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
											<h3 className="mb-2 font-medium text-gray-900 text-lg">
												No trips
											</h3>
											<p className="text-gray-500 text-sm">
												You don't have any trips yet.
											</p>
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
					showCloseButton={!isMobile}
					className={cn(
						isMobile
							? "m-0 flex h-full w-full max-w-full flex-col rounded-none bg-gray-50 p-0"
							: "w-full max-w-lg bg-gray-50",
					)}
				>
					{selectedBooking && (
						<div
							className={cn(
								isMobile ? "flex h-full flex-col" : "flex flex-col",
							)}
						>
							{/* Header */}
							<div
								className={cn(
									"flex items-center justify-between border-b bg-white px-4 py-3",
									isMobile ? "" : "rounded-t-lg",
								)}
							>
								<DialogHeader className="flex-1">
									<DialogTitle className="flex items-center gap-2 text-left">
										Trip Details
										<span className="font-mono text-gray-400 text-xs">
											#{(selectedBooking as any).referenceNumber || "N/A"}
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
							<div
								className={cn(
									"flex-1 space-y-4 p-4",
									isMobile ? "min-h-0 flex-grow overflow-y-auto" : "",
								)}
							>
								{/* Status and Time - Minimal */}
								<div className="rounded-lg border bg-white p-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-gray-500" />
											<div>
												<p className="font-medium text-sm">
													{format(
														new Date(selectedBooking.scheduledPickupTime),
														"MMM dd, yyyy",
													)}
												</p>
												<p className="text-gray-500 text-xs">
													{format(
														new Date(selectedBooking.scheduledPickupTime),
														"h:mm a",
													)}
												</p>
											</div>
										</div>
										<Badge
											variant={
												selectedBooking.status === "completed"
													? "default"
													: selectedBooking.status === "cancelled"
														? "destructive"
														: selectedBooking.status === "confirmed"
															? "secondary"
															: "outline"
											}
											className="text-xs"
										>
											{selectedBooking.status.replace("_", " ").toUpperCase()}
										</Badge>
									</div>
								</div>

								{/* Route Details */}
								<div className="rounded-lg border bg-white p-4">
									<h3 className="mb-3 font-semibold text-gray-900">Route</h3>
									<div className="space-y-3">
										<div className="flex items-start gap-3">
											<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-green-500" />
											<div>
												<p className="font-medium text-sm">Pickup</p>
												<p className="text-gray-600 text-xs">
													{selectedBooking.originAddress ||
														selectedBooking.pickupAddress}
												</p>
											</div>
										</div>
										{selectedBooking.stops &&
											selectedBooking.stops.length > 0 &&
											selectedBooking.stops.map((stop: any, index: number) => (
												<div
													key={stop.id || index}
													className="flex items-start gap-3"
												>
													<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
													<div>
														<p className="font-medium text-sm">
															Stop {index + 1}
														</p>
														<p className="text-gray-600 text-xs">
															{stop.address}
														</p>
													</div>
												</div>
											))}
										{selectedBooking.destinationAddress && (
											<div className="flex items-start gap-3">
												<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />
												<div>
													<p className="font-medium text-sm">Drop-off</p>
													<p className="text-gray-600 text-xs">
														{selectedBooking.destinationAddress}
													</p>
												</div>
											</div>
										)}
									</div>
								</div>

								{/* Driver Information */}
								{(selectedBooking.driver ||
									selectedBooking.driverId ||
									[
										"driver_assigned",
										"driver_en_route",
										"in_progress",
										"arrived_pickup",
										"passenger_on_board",
										"completed",
									].includes(selectedBooking.status)) && (
									<div className="rounded-lg border bg-white p-4">
										<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
											<Car className="h-5 w-5" />
											Assigned Vehicle
										</h3>
										<div className="space-y-3">
											{/* Vehicle Info */}
											<div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
												<Car className="h-8 w-8 text-blue-600" />
												<div>
													<p className="font-medium text-sm">
														{selectedBooking.driver?.car?.name ||
															selectedBooking.car?.name ||
															"Test Car 1"}
													</p>
													<p className="text-gray-600 text-xs">
														Assigned Vehicle
													</p>
												</div>
											</div>

											{/* Driver Contact */}
											<div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
													<UserIcon className="h-5 w-5 text-gray-500" />
												</div>
												<div className="flex-1">
													<p className="font-medium text-sm">
														{selectedBooking.driver?.user?.name ||
															selectedBooking.driver?.name ||
															selectedBooking.driverName ||
															"Ivan Gemota"}
													</p>
													<p className="text-gray-600 text-xs">
														{selectedBooking.driver?.phoneNumber ||
															selectedBooking.driver?.user?.phoneNumber ||
															selectedBooking.driverPhone ||
															"Contact info not available"}
													</p>
												</div>
												<div className="flex gap-2">
													<Button
														size="sm"
														variant="outline"
														className="h-8 w-8 p-0 hover:border-green-300 hover:bg-green-50"
														onClick={(e) => {
															e.stopPropagation();
															const phone =
																selectedBooking.driver?.phoneNumber ||
																selectedBooking.driver?.user?.phoneNumber ||
																selectedBooking.driverPhone;
															if (
																phone &&
																phone !== "Contact info not available"
															) {
																window.location.href = `tel:${phone}`;
															}
														}}
														disabled={
															!selectedBooking.driver?.phoneNumber &&
															!selectedBooking.driver?.user?.phoneNumber &&
															!selectedBooking.driverPhone
														}
													>
														<Phone className="h-3.5 w-3.5 text-green-600" />
													</Button>
													<Button
														size="sm"
														variant="outline"
														className="h-8 w-8 p-0 hover:border-blue-300 hover:bg-blue-50"
														onClick={(e) => {
															e.stopPropagation();
															const phone =
																selectedBooking.driver?.phoneNumber ||
																selectedBooking.driver?.user?.phoneNumber ||
																selectedBooking.driverPhone;
															if (
																phone &&
																phone !== "Contact info not available"
															) {
																window.location.href = `sms:${phone}`;
															}
														}}
														disabled={
															!selectedBooking.driver?.phoneNumber &&
															!selectedBooking.driver?.user?.phoneNumber &&
															!selectedBooking.driverPhone
														}
													>
														<MessageSquare className="h-3.5 w-3.5 text-blue-600" />
													</Button>
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Pricing */}
								<div className="rounded-lg border bg-white p-4">
									<h3 className="mb-3 font-semibold text-gray-900">Pricing</h3>
									<div className="flex items-center justify-between">
										<span className="font-bold text-lg">
											{formatPrice(
												selectedBooking.amount ||
													selectedBooking.quotedAmount ||
													selectedBooking.totalAmount ||
													0,
											)}
										</span>
										<span className="text-gray-500 text-sm">
											{selectedBooking.bookingType === "package"
												? "Service Package"
												: "Custom Booking"}
										</span>
									</div>
								</div>

								{/* Special Requests */}
								{selectedBooking.specialRequests && (
									<div className="rounded-lg border bg-white p-4">
										<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
											<MessageSquare className="h-4 w-4 text-blue-600" />
											Your Special Requests
										</h3>
										<div className="rounded-lg bg-blue-50 p-3">
											<p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
												{selectedBooking.specialRequests}
											</p>
										</div>
									</div>
								)}

								{/* Additional Notes */}
								{selectedBooking.additionalNotes && (
									<div className="rounded-lg border bg-white p-4">
										<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
											<MessageSquare className="h-4 w-4 text-primary" />
											Additional Notes
										</h3>
										<div className="rounded-lg bg-gray-50 p-3">
											<p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
												{selectedBooking.additionalNotes}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Driver Info Dialog/Fullscreen */}
			<Dialog open={driverInfoOpen} onOpenChange={setDriverInfoOpen}>
				<DialogContent
					showCloseButton={!isMobile}
					className={cn(
						isMobile
							? "m-0 flex h-full w-full max-w-full flex-col rounded-none bg-gray-50 p-0"
							: "w-full max-w-lg bg-gray-50",
					)}
				>
					{selectedDriverBooking &&
						(selectedDriverBooking.driver ||
							selectedDriverBooking.assignedDriver) && (
							<div
								className={cn(
									isMobile ? "flex h-full flex-col" : "flex flex-col",
								)}
							>
								{/* Header */}
								<div
									className={cn(
										"flex items-center justify-between border-b bg-white px-4 py-3",
										isMobile ? "" : "rounded-t-lg",
									)}
								>
									<DialogHeader className="flex-1">
										<DialogTitle className="flex items-center gap-2 text-left">
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
								<div
									className={cn(
										"flex-1 space-y-4 p-4",
										isMobile ? "overflow-y-auto" : "",
									)}
								>
									{/* Driver Details */}
									<div className="rounded-lg border bg-white p-4">
										<h3 className="mb-3 font-semibold text-gray-900">
											Driver Details
										</h3>
										<div className="mb-4 flex items-center gap-3">
											{selectedDriverBooking.driver?.user?.image ||
											selectedDriverBooking.assignedDriver?.user?.image ? (
												<img
													src={
														selectedDriverBooking.driver?.user?.image ||
														selectedDriverBooking.assignedDriver?.user?.image
													}
													alt={
														selectedDriverBooking.driver?.user?.name ||
														selectedDriverBooking.assignedDriver?.user?.name
													}
													className="h-12 w-12 rounded-full object-cover"
												/>
											) : (
												<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
													<Users className="h-6 w-6 text-primary" />
												</div>
											)}
											<div className="flex-1">
												<h4 className="font-semibold text-lg">
													{selectedDriverBooking.driver?.user?.name ||
														selectedDriverBooking.driver?.name ||
														selectedDriverBooking.assignedDriver?.user?.name ||
														selectedDriverBooking.driverName ||
														"Driver"}
												</h4>
												<p className="text-gray-600 text-sm">
													Professional Driver
												</p>
											</div>
										</div>

										{/* Contact Information */}
										<div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-3">
											<div>
												<p className="mb-1 font-medium text-gray-500 text-xs uppercase tracking-wide">
													Phone
												</p>
												<p className="flex items-center gap-1 font-medium text-sm">
													<Phone className="h-3 w-3" />
													{selectedDriverBooking.driver?.phoneNumber ||
														selectedDriverBooking.driver?.user?.phoneNumber ||
														selectedDriverBooking.assignedDriver?.phoneNumber ||
														selectedDriverBooking.driverPhone ||
														"Not provided"}
												</p>
											</div>
											<div>
												<p className="mb-1 font-medium text-gray-500 text-xs uppercase tracking-wide">
													License
												</p>
												<p className="font-medium text-sm">
													{selectedDriverBooking.driver?.licenseNumber ||
														selectedDriverBooking.assignedDriver
															?.licenseNumber ||
														"N/A"}
												</p>
											</div>
										</div>
									</div>

									{/* Vehicle Information */}
									{(selectedDriverBooking.driver?.car ||
										selectedDriverBooking.assignedDriver?.car ||
										selectedDriverBooking.car) && (
										<div className="rounded-lg border bg-white p-4">
											<h3 className="mb-3 font-semibold text-gray-900">
												Vehicle Information
											</h3>
											<div className="space-y-3">
												<div className="flex justify-between">
													<span className="text-gray-500 text-sm">
														Vehicle:
													</span>
													<span className="font-medium text-sm">
														{selectedDriverBooking.driver?.car?.name ||
															selectedDriverBooking.assignedDriver?.car?.name ||
															selectedDriverBooking.car?.name ||
															"Vehicle information unavailable"}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-gray-500 text-sm">Plate:</span>
													<span className="font-medium text-sm">
														{selectedDriverBooking.driver?.car?.licensePlate ||
															selectedDriverBooking.assignedDriver?.car
																?.licensePlate ||
															selectedDriverBooking.car?.licensePlate ||
															"N/A"}
													</span>
												</div>
												{(selectedDriverBooking.driver?.car?.color ||
													selectedDriverBooking.assignedDriver?.car?.color ||
													selectedDriverBooking.car?.color) && (
													<div className="flex justify-between">
														<span className="text-gray-500 text-sm">
															Color:
														</span>
														<span className="font-medium text-sm">
															{selectedDriverBooking.driver?.car?.color ||
																selectedDriverBooking.assignedDriver?.car
																	?.color ||
																selectedDriverBooking.car?.color}
														</span>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Action Buttons */}
									<div
										className={cn("flex gap-2 pt-4", isMobile ? "pb-4" : "")}
									>
										{(() => {
											const phoneNumber =
												selectedDriverBooking.driver?.phoneNumber ||
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
														className="h-12 flex-1"
													>
														<Phone className="mr-2 h-4 w-4" />
														Call Driver
													</Button>
													<Button
														onClick={(e) => {
															e.stopPropagation();
															window.location.href = `sms:${phoneNumber}`;
														}}
														variant="outline"
														className="h-12 flex-1"
													>
														<MessageSquare className="mr-2 h-4 w-4" />
														Message
													</Button>
												</>
											) : (
												<div className="w-full py-4 text-center text-gray-500 text-sm">
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
