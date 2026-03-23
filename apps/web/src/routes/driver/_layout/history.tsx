import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import { format, isSameDay } from "date-fns";
import {
	CalendarIcon,
	CarIcon,
	ChevronRight,
	ClockIcon,
	DollarSignIcon,
	MapPinIcon,
	MessageSquare,
	PhoneIcon,
	UserIcon,
	UsersIcon,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BookingTypeBadge } from "@/components/booking-type-badge";
import { useGetDriverBookingsQuery } from "@/features/driver/_hooks/query/use-get-driver-bookings-query";
import { formatDistanceKm } from "@/utils/format";

export const Route = createFileRoute("/driver/_layout/history")({
	component: HistoryPage,
});

function HistoryPage() {
	// Check if mobile using window width
	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		);
	}, []);

	// State for active tab
	const [activeTab, setActiveTab] = useState("all");

	// State for selected trip details
	const [selectedTrip, setSelectedTrip] = useState<any>(null);

	// State for trip details dialog
	const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
	const [selectedBookingForDetails, setSelectedBookingForDetails] =
		useState<any>(null);

	// Get real booking data (fetch all completed bookings)
	const { data: bookingsData, isLoading } = useGetDriverBookingsQuery({
		limit: 100, // Fetch more records to show full history
	});

	// Transform backend data to match frontend structure
	const trips = useMemo(() => {
		if (!bookingsData?.data) return [];

		return bookingsData.data
			.map((booking: any) => ({
				id: booking.id,
				customerName: booking.customerName,
				passengerCount: booking.passengerCount,
				car: booking.car,
				pickupAddress: booking.originAddress,
				destinationAddress: booking.destinationAddress,
				stops: booking.stops
					? booking.stops.sort((a: any, b: any) => a.stopOrder - b.stopOrder)
					: [],
				scheduledTime: new Date(booking.scheduledPickupTime),
				completedTime: booking.serviceCompletedAt
					? new Date(booking.serviceCompletedAt)
					: null,
				passengers: booking.passengerCount || 1,
				finalAmount:
					booking.driverShare ??
					booking.finalAmount ??
					(booking.quotedAmount || 0) + (booking.extraCharges || 0),
				distance:
					(booking.actualDistance ?? booking.estimatedDistance) != null
						? formatDistanceKm(
								booking.actualDistance ?? booking.estimatedDistance,
							)
						: "N/A",
				duration: booking.estimatedDuration
					? `${Math.round(booking.estimatedDuration / 60)} min`
					: "N/A",
				status: booking.status as "completed" | "cancelled" | "no_show",
				// Pass through booking type and offload fields for badge
				bookingType: booking.bookingType,
				packageId: booking.packageId,
				package: booking.package,
				estimatedDuration: booking.estimatedDuration,
				offloadDetails: booking.offloadDetails,
			}))
			.filter((trip) =>
				["completed", "cancelled", "no_show"].includes(trip.status),
			);
	}, [bookingsData]);

	const completedTrips = trips.filter(
		(trip) => trip.status === "completed" || trip.status === "no_show",
	);
	const cancelledTrips = trips.filter((trip) => trip.status === "cancelled");

	// Handle trip click to show details
	const handleTripClick = (trip: any) => {
		setSelectedTrip(trip);
		handleOpenBookingDetails(trip);
	};

	// Handle opening booking details dialog (same as trips.tsx)
	const handleOpenBookingDetails = (booking: any) => {
		// Convert trip data structure to booking data structure for the dialog
		// Note: We need to get the original booking data to access extraCharges and extras
		const originalBooking = bookingsData?.data?.find(
			(b: any) => b.id === booking.id,
		);

		// Debug logging
		console.log("DEBUG: Original booking data:", originalBooking);
		console.log("DEBUG: Extras data:", (originalBooking as any)?.extras);

		const bookingData = {
			id: booking.id,
			scheduledPickupTime: booking.scheduledTime,
			originAddress: booking.pickupAddress,
			destinationAddress: booking.destinationAddress,
			stops: booking.stops || [],
			customerName:
				booking.customerName ||
				(booking.passengers
					? `${booking.passengers} Passenger${booking.passengers > 1 ? "s" : ""}`
					: "1 Passenger"),
			customerPhone: null,
			status: booking.status,
			finalAmount: booking.finalAmount,
			driverShare: originalBooking?.driverShare ?? booking.finalAmount,
			quotedAmount: originalBooking?.quotedAmount || booking.finalAmount,
			extraCharges: originalBooking?.extraCharges || 0,
			extras: (originalBooking as any)?.extras || [],
			specialRequests: originalBooking?.specialRequests || null,
			additionalNotes: originalBooking?.additionalNotes || null,
			car: originalBooking?.car || null,
		};

		setSelectedBookingForDetails(bookingData);
		setBookingDetailsOpen(true);
	};

	// Group trips by date
	const groupTripsByDate = (tripsList: typeof trips) => {
		const grouped: Record<string, typeof trips> = {};

		tripsList.forEach((trip: any) => {
			const dateKey = format(trip.scheduledTime, "yyyy-MM-dd");
			if (!grouped[dateKey]) {
				grouped[dateKey] = [];
			}
			grouped[dateKey].push(trip);
		});

		// Sort dates in descending order (newest first)
		const sortedDates = Object.keys(grouped).sort(
			(a: string, b: string) => new Date(b).getTime() - new Date(a).getTime(),
		);

		const result: Array<{ date: string; trips: typeof trips }> = [];
		sortedDates.forEach((date) => {
			result.push({
				date,
				trips: grouped[date].sort(
					(a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime(),
				),
			});
		});

		return result;
	};

	const TripCard = ({
		trip,
		onClick,
	}: {
		trip: (typeof trips)[0];
		onClick?: () => void;
	}) => {
		return (
			<Card
				className={cn(
					"w-full cursor-pointer overflow-hidden bg-white transition-colors hover:shadow-md",
					isMobile
						? "rounded-none border-0 border-gray-200 border-b shadow-none"
						: "border border-gray-200 shadow-sm",
				)}
				onClick={onClick}
			>
				<CardContent
					className={cn(
						"w-full min-w-0 overflow-x-hidden",
						isMobile ? "px-4 py-3" : "p-4",
					)}
				>
					{/* Booking ID and Date/Time */}
					<div className="mb-3 flex items-center justify-between">
						<span className="font-semibold text-gray-900 text-sm">
							Trip #{trip.id.slice(-6)}
						</span>
						<div className="flex items-center gap-2">
							<BookingTypeBadge booking={trip as any} />
							{trip.bookingType === "offload" && trip.offloadDetails && (
								<Badge
									variant="outline"
									className="border-orange-200 bg-orange-50 text-orange-700 text-xs"
								>
									{trip.offloadDetails.offloaderName}
								</Badge>
							)}
							<span className="text-gray-500 text-xs">
								{format(trip.scheduledTime, "MMM dd 'at' h:mm a")}
							</span>
						</div>
					</div>

					{/* Customer, Pax, and Vehicle info */}
					<div className="mb-3 space-y-2">
						{/* First row: Customer and Pax */}
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1.5 text-gray-600 text-xs">
								<UserIcon className="h-3.5 w-3.5 text-gray-500" />
								<span className="font-medium">
									{(trip as any).customerName}
								</span>
							</div>
							<div className="flex items-center gap-1 text-gray-600 text-xs">
								<UsersIcon className="h-3.5 w-3.5 text-gray-500" />
								<span className="font-medium">
									{(trip as any).passengerCount || 1} pax
								</span>
							</div>
						</div>
						{/* Second row: Vehicle info (if available) */}
						{((trip as any).car?.name ||
							(trip as any).assignedCar?.name ||
							(trip as any).carName) && (
							<div className="flex items-center gap-1 text-gray-600 text-xs">
								<CarIcon className="h-3.5 w-3.5 text-gray-500" />
								<span className="font-medium">
									{(trip as any).car?.name ||
										(trip as any).assignedCar?.name ||
										(trip as any).carName}
								</span>
							</div>
						)}
					</div>

					<div className="flex items-center justify-between">
						{/* Left side - Route info */}
						<div className="min-w-0 flex-1 space-y-2">
							{/* Route - Pickup to Drop-off */}
							<div className="space-y-2">
								<div className="flex items-start gap-2">
									<div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
									<p className="text-gray-600 text-xs leading-tight">
										{trip.pickupAddress
											? isMobile
												? trip.pickupAddress.length > 35
													? trip.pickupAddress.substring(0, 35) + "..."
													: trip.pickupAddress
												: trip.pickupAddress
											: "Pickup location unavailable"}
									</p>
								</div>
								<div className="flex items-start gap-2">
									<div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
									<p className="text-gray-600 text-xs leading-tight">
										{trip.destinationAddress
											? isMobile
												? trip.destinationAddress.length > 35
													? trip.destinationAddress.substring(0, 35) + "..."
													: trip.destinationAddress
												: trip.destinationAddress
											: "Destination unavailable"}
									</p>
								</div>
							</div>
						</div>
						<ChevronRight className="h-5 w-5 text-gray-400" />
					</div>

					{/* Offloader Details Section */}
					{trip.bookingType === "offload" && trip.offloadDetails && (
						<div className="mt-3 border-gray-100 border-t pt-3">
							<div className="rounded-md border border-orange-100 bg-orange-50 p-2">
								<div className="mb-1 flex items-center gap-1">
									<CarIcon className="h-3 w-3 text-orange-600" />
									<span className="font-semibold text-orange-800 text-xs">
										Offload Booking
									</span>
								</div>
								<div className="space-y-1">
									<div className="text-orange-700 text-xs">
										<span className="font-medium">Company:</span>{" "}
										{trip.offloadDetails.offloaderName}
									</div>
									<div className="text-orange-700 text-xs">
										<span className="font-medium">Job Type:</span>{" "}
										{trip.offloadDetails.jobType}
									</div>
									<div className="text-orange-700 text-xs">
										<span className="font-medium">Vehicle:</span>{" "}
										{trip.offloadDetails.vehicleType}
									</div>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		);
	};

	const EmptyState = ({
		title,
		description,
	}: {
		title: string;
		description: string;
	}) => (
		<div className="flex flex-col items-center justify-center py-12">
			<ClockIcon className="mb-4 h-16 w-16 text-gray-300" />
			<h3 className="mb-2 font-medium text-gray-900 text-lg">{title}</h3>
			<p className="text-center text-gray-500">{description}</p>
		</div>
	);

	const renderTripsWithDateGroups = (tripsList: any[]) => {
		const groupedTrips = groupTripsByDate(tripsList);

		if (isLoading) {
			return (
				<div className="flex flex-col items-center justify-center py-12">
					<div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="text-center text-gray-500">Loading trip history...</p>
				</div>
			);
		}

		if (groupedTrips.length === 0) {
			return (
				<EmptyState
					title="No Trip History"
					description="You haven't completed any trips yet. Start accepting trips to build your history!"
				/>
			);
		}

		return (
			<div className={cn(isMobile ? "" : "space-y-6")}>
				{groupedTrips.map(({ date, trips: dayTrips }) => (
					<div key={date} className={cn(isMobile ? "" : "space-y-4")}>
						{/* Date Header */}
						<div
							className={cn(
								"sticky top-0 z-10 bg-gray-50 font-medium text-gray-900",
								isMobile
									? "border-gray-200 border-b px-4 py-2 text-sm"
									: "rounded-lg px-3 py-2 text-base",
							)}
						>
							{format(new Date(date), "EEEE, do MMMM yyyy")}
						</div>

						{/* Trips for this date */}
						<div className={cn(isMobile ? "" : "space-y-3")}>
							{dayTrips.map((trip: any) => (
								<TripCard
									key={trip.id}
									trip={trip}
									onClick={() => handleTripClick(trip)}
								/>
							))}
						</div>
					</div>
				))}
				{/* Bottom padding for mobile to ensure last item is visible above bottom nav */}
				{isMobile && <div className="h-20" />}
			</div>
		);
	};

	return (
		<div
			className={cn(
				isMobile
					? "flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50"
					: "mx-auto max-w-4xl space-y-6 p-4",
			)}
		>
			{/* Header */}
			<div
				className={cn(
					"flex-shrink-0 bg-white",
					isMobile
						? "border-gray-200 border-b px-4 py-3"
						: "rounded-lg border border-gray-200 p-4",
				)}
			>
				<h1
					className={cn(
						"font-bold text-gray-900",
						isMobile ? "text-lg" : "text-2xl",
					)}
				>
					History
				</h1>
				<p className="text-gray-600 text-sm">
					View all your past trips and earnings
				</p>
			</div>

			{/* Tabs */}
			<div className={cn(isMobile ? "flex-1 overflow-y-auto" : "")}>
				{isMobile ? (
					// Mobile: Custom tab design with state management
					<>
						{/* Mobile Tab Headers */}
						<div className="sticky top-0 z-20 border-gray-200 border-b bg-white">
							<div className="flex w-full">
								<button
									onClick={() => setActiveTab("all")}
									className={cn(
										"min-w-0 flex-1 border-b-2 px-1 py-3 text-center font-medium text-xs transition-all duration-200",
										activeTab === "all"
											? "border-primary bg-primary/5 text-primary"
											: "border-transparent text-gray-600 hover:text-gray-900",
									)}
								>
									<span className="truncate">All ({trips.length})</span>
								</button>
								<button
									onClick={() => setActiveTab("completed")}
									className={cn(
										"min-w-0 flex-1 border-b-2 px-1 py-3 text-center font-medium text-xs transition-all duration-200",
										activeTab === "completed"
											? "border-primary bg-primary/5 text-primary"
											: "border-transparent text-gray-600 hover:text-gray-900",
									)}
								>
									<span className="truncate">
										Done ({completedTrips.length})
									</span>
								</button>
								<button
									onClick={() => setActiveTab("cancelled")}
									className={cn(
										"min-w-0 flex-1 border-b-2 px-1 py-3 text-center font-medium text-xs transition-all duration-200",
										activeTab === "cancelled"
											? "border-primary bg-primary/5 text-primary"
											: "border-transparent text-gray-600 hover:text-gray-900",
									)}
								>
									<span className="truncate">
										Cancelled ({cancelledTrips.length})
									</span>
								</button>
							</div>
						</div>

						{/* Mobile Tab Content */}
						<div className="flex-1">
							{activeTab === "all" && renderTripsWithDateGroups(trips)}
							{activeTab === "completed" &&
								renderTripsWithDateGroups(completedTrips)}
							{activeTab === "cancelled" &&
								renderTripsWithDateGroups(cancelledTrips)}
						</div>
					</>
				) : (
					// Desktop: Use shadcn Tabs component
					<Tabs defaultValue="all" className="w-full">
						<TabsList className="grid h-12 w-full grid-cols-3">
							<TabsTrigger value="all">All Jobs ({trips.length})</TabsTrigger>
							<TabsTrigger value="completed">
								Completed ({completedTrips.length})
							</TabsTrigger>
							<TabsTrigger value="cancelled">
								Cancelled ({cancelledTrips.length})
							</TabsTrigger>
						</TabsList>

						<TabsContent value="all" className="mt-6">
							{renderTripsWithDateGroups(trips)}
						</TabsContent>

						<TabsContent value="completed" className="mt-6">
							{renderTripsWithDateGroups(completedTrips)}
						</TabsContent>

						<TabsContent value="cancelled" className="mt-6">
							{renderTripsWithDateGroups(cancelledTrips)}
						</TabsContent>
					</Tabs>
				)}
			</div>

			{/* Trip Details Dialog (same as trips.tsx) */}
			<Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
				<DialogContent
					showCloseButton={false}
					className={cn(
						isMobile
							? "m-0 h-full w-full max-w-full rounded-none bg-gray-50 p-0"
							: "max-w-md bg-gray-50",
					)}
				>
					{selectedBookingForDetails && (
						<div
							className={cn(
								isMobile ? "flex h-full flex-col" : "flex flex-col",
							)}
						>
							{/* Compact Header with gradient background - matches client account style */}
							<div
								className={cn(
									"flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-primary to-primary/80 p-4 text-white",
									isMobile ? "pt-6" : "",
								)}
							>
								<div className="flex items-center gap-3">
									<ClockIcon className="h-5 w-5 text-white/80" />
									<div>
										<h2 className="font-bold text-lg">
											{format(
												new Date(selectedBookingForDetails.scheduledPickupTime),
												"MMM dd, yyyy 'at' HH:mm",
											)}
										</h2>
										<div className="mt-1 flex items-center gap-2">
											<span className="text-white/80 text-xs">
												Trip ID:{" "}
												{selectedBookingForDetails.id.slice(-6).toUpperCase()}
											</span>
											<Badge className="border-white/30 bg-white/20 px-2 py-0.5 text-white text-xs">
												{selectedBookingForDetails.status
													.replace("_", " ")
													.toUpperCase()}
											</Badge>
										</div>
									</div>
								</div>

								<Button
									variant="ghost"
									size="lg"
									className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-white/30 p-0 text-white transition-all duration-200 hover:border-white/50 hover:bg-white/20"
									onClick={() => setBookingDetailsOpen(false)}
								>
									<X className="h-6 w-6" />
								</Button>
							</div>

							{/* Scrollable Content */}
							<div
								className={cn(
									"flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4",
									isMobile ? "pb-20" : "",
								)}
							>
								{/* Route Information */}
								<div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
									<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 text-sm">
										<MapPinIcon className="h-4 w-4 text-primary" />
										Route Details
									</h3>
									<div className="space-y-3">
										{/* Pick up */}
										<div className="flex items-start gap-2">
											<div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-500" />
											<div className="min-w-0 flex-1">
												<p className="mb-0.5 font-medium text-green-700 text-xs">
													Pick up
												</p>
												<p className="line-clamp-2 break-words text-gray-600 text-xs leading-tight">
													{selectedBookingForDetails.originAddress}
												</p>
											</div>
										</div>

										{/* Stops (if any) */}
										{selectedBookingForDetails.stops &&
											selectedBookingForDetails.stops.length > 0 && (
												<>
													{selectedBookingForDetails.stops.map(
														(stop: any, index: number) => (
															<div key={stop.id || index}>
																<div className="ml-1 h-2 border-gray-200 border-l" />
																<div className="flex items-start gap-2">
																	<div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
																	<div className="min-w-0 flex-1">
																		<p className="mb-0.5 font-medium text-blue-700 text-xs">
																			Stop {index + 1}
																		</p>
																		<p className="line-clamp-2 break-words text-gray-600 text-xs leading-tight">
																			{stop.address}
																		</p>
																	</div>
																</div>
															</div>
														),
													)}
												</>
											)}

										<div className="ml-1 h-2 border-gray-200 border-l" />

										{/* Drop off */}
										<div className="flex items-start gap-2">
											<div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500" />
											<div className="min-w-0 flex-1">
												<p className="mb-0.5 font-medium text-red-700 text-xs">
													Drop off
												</p>
												<p className="line-clamp-2 break-words text-gray-600 text-xs leading-tight">
													{selectedBookingForDetails.destinationAddress}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Customer Information */}
								<div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
									<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 text-sm">
										<UserIcon className="h-4 w-4 text-primary" />
										Customer Details
									</h3>
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/30">
											<UserIcon className="h-5 w-5 text-primary" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold text-gray-900 text-sm">
												{selectedBookingForDetails.customerName}
											</p>
											{selectedBookingForDetails.customerPhone && (
												<p className="text-gray-600 text-xs">
													{selectedBookingForDetails.customerPhone}
												</p>
											)}
										</div>
									</div>
								</div>

								{/* Offloader Details */}
								{selectedBookingForDetails.bookingType === "offload" &&
									selectedBookingForDetails.offloadDetails && (
										<div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
											<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 text-sm">
												<CarIcon className="h-4 w-4 text-orange-600" />
												Offload Booking Details
											</h3>
											<div className="space-y-2 rounded-lg bg-orange-50 p-3">
												<div>
													<span className="font-medium text-orange-600 text-xs">
														Company:
													</span>
													<p className="font-medium text-orange-800 text-sm">
														{
															selectedBookingForDetails.offloadDetails
																.offloaderName
														}
													</p>
												</div>
												<div>
													<span className="font-medium text-orange-600 text-xs">
														Job Type:
													</span>
													<p className="text-orange-800 text-sm">
														{selectedBookingForDetails.offloadDetails.jobType}
													</p>
												</div>
												<div>
													<span className="font-medium text-orange-600 text-xs">
														Vehicle Type:
													</span>
													<p className="text-orange-800 text-sm">
														{
															selectedBookingForDetails.offloadDetails
																.vehicleType
														}
													</p>
												</div>
											</div>
										</div>
									)}

								{/* Special Requests */}
								{selectedBookingForDetails.specialRequests && (
									<div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
										<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 text-sm">
											<MessageSquare className="h-4 w-4 text-blue-600" />
											Special Requests
										</h3>
										<div className="rounded-lg bg-blue-50 p-3">
											<p className="whitespace-pre-wrap break-words text-gray-700 text-sm leading-relaxed">
												{selectedBookingForDetails.specialRequests}
											</p>
										</div>
									</div>
								)}

								{/* Additional Notes */}
								{selectedBookingForDetails.additionalNotes && (
									<div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
										<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 text-sm">
											<MessageSquare className="h-4 w-4 text-orange-600" />
											Additional Notes
										</h3>
										<div className="rounded-lg bg-orange-50 p-3">
											<p className="whitespace-pre-wrap break-words text-gray-700 text-sm leading-relaxed">
												{selectedBookingForDetails.additionalNotes}
											</p>
										</div>
									</div>
								)}

								{/* Your Share - driver only sees their commission (excludes toll/parking, includes waiting) */}
								<div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
									<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 text-sm">
										<DollarSignIcon className="h-4 w-4 text-primary" />
										Your Share
									</h3>
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="font-bold text-base text-gray-900">
												Earnings:
											</span>
											<span className="font-bold text-gray-900 text-lg">
												$
												{(
													selectedBookingForDetails.driverShare ??
													selectedBookingForDetails.finalAmount ??
													(selectedBookingForDetails.quotedAmount || 0) +
														(selectedBookingForDetails.extraCharges || 0)
												).toFixed(2)}
											</span>
										</div>
										{/* Extras breakdown - only show when there are non-zero charges */}
										{selectedBookingForDetails.extras &&
											selectedBookingForDetails.extras.length > 0 &&
											(selectedBookingForDetails.extraCharges ?? 0) > 0 && (
												<div className="space-y-2">
													<div className="mt-3 mb-2 font-medium text-gray-700 text-sm">
														Extra Charges:
													</div>
													{(() => {
														const allExtras = selectedBookingForDetails.extras;
														const extras = allExtras.filter(
															(e: any) =>
																(e.additionalWaitTime ?? 0) > 0 ||
																(e.unscheduledStops ?? 0) > 0 ||
																(e.parkingCharges ?? 0) > 0 ||
																(e.tollCharges ?? 0) > 0 ||
																(e.otherChargesAmount ?? 0) > 0,
														);
														if (extras.length === 0) return null;
														const totalTolls = allExtras.reduce(
															(s: number, e: any) => s + (e.tollCharges ?? 0),
															0,
														);
														const totalParking = allExtras.reduce(
															(s: number, e: any) =>
																s + (e.parkingCharges ?? 0),
															0,
														);
														const totalOther = allExtras.reduce(
															(s: number, e: any) =>
																s + (e.otherChargesAmount ?? 0),
															0,
														);
														const extraTotal =
															selectedBookingForDetails.extraCharges ?? 0;
														const waitingTimeCharge = Math.max(
															0,
															extraTotal -
																totalTolls -
																totalParking -
																totalOther,
														);
														return (
															<>
																{waitingTimeCharge > 0 && (
																	<div className="mb-2 flex items-center justify-between rounded bg-amber-50 px-3 py-2">
																		<span className="text-gray-600 text-xs">
																			Waiting Time Charge:
																		</span>
																		<span className="font-semibold text-amber-600 text-xs">
																			+${waitingTimeCharge.toFixed(2)}
																		</span>
																	</div>
																)}
																{extras.map((extra: any, index: number) => (
																	<div
																		key={index}
																		className="space-y-2 rounded-lg bg-gray-50 p-3"
																	>
																		{extra.additionalWaitTime > 0 && (
																			<div className="flex items-center justify-between">
																				<span className="text-gray-600 text-xs">
																					Additional Wait Time:
																				</span>
																				<span className="font-semibold text-amber-600 text-xs">
																					{extra.additionalWaitTime} minutes
																				</span>
																			</div>
																		)}
																		{extra.unscheduledStops > 0 && (
																			<div className="flex items-center justify-between">
																				<span className="text-gray-600 text-xs">
																					Unscheduled Stops:
																				</span>
																				<span className="font-semibold text-blue-600 text-xs">
																					+$
																					{(
																						extra.unscheduledStops || 0
																					).toFixed(2)}
																				</span>
																			</div>
																		)}
																		{(extra.parkingCharges ?? 0) > 0 && (
																			<div className="flex items-center justify-between">
																				<span className="text-gray-600 text-xs">
																					Parking Charges:
																				</span>
																				<span className="font-semibold text-purple-600 text-xs">
																					+$
																					{(extra.parkingCharges || 0).toFixed(
																						2,
																					)}
																				</span>
																			</div>
																		)}
																		{(extra.tollCharges ?? 0) > 0 && (
																			<div className="flex items-center justify-between">
																				<span className="text-gray-600 text-xs">
																					Toll Charges
																					{extra.tollLocation
																						? ` (${extra.tollLocation})`
																						: ""}
																					:
																				</span>
																				<span className="font-semibold text-orange-600 text-xs">
																					+$
																					{(extra.tollCharges || 0).toFixed(2)}
																				</span>
																			</div>
																		)}
																		{(extra.otherChargesAmount ?? 0) > 0 && (
																			<div className="space-y-1">
																				<div className="flex items-center justify-between">
																					<span className="text-gray-600 text-xs">
																						Other Charges:
																					</span>
																					<span className="font-semibold text-red-600 text-xs">
																						+$
																						{(
																							extra.otherChargesAmount || 0
																						).toFixed(2)}
																					</span>
																				</div>
																				{extra.otherChargesDescription && (
																					<p className="text-gray-500 text-xs italic">
																						{extra.otherChargesDescription}
																					</p>
																				)}
																			</div>
																		)}
																		{extra.notes && (
																			<div className="border-gray-200 border-t pt-1">
																				<p className="text-gray-500 text-xs">
																					<span className="font-medium">
																						Notes:
																					</span>{" "}
																					{extra.notes}
																				</p>
																			</div>
																		)}
																	</div>
																))}
															</>
														);
													})()}
												</div>
											)}

										{/* Simple extras total if no detailed breakdown available */}
										{(!selectedBookingForDetails.extras ||
											selectedBookingForDetails.extras.length === 0) &&
											(selectedBookingForDetails.extraCharges ?? 0) > 0 && (
												<div className="flex items-center justify-between">
													<span className="text-gray-600 text-sm">
														Additional Charges:
													</span>
													<span className="font-semibold text-orange-600 text-sm">
														+$
														{(
															selectedBookingForDetails.extraCharges || 0
														).toFixed(2)}
													</span>
												</div>
											)}

										{/* Show total extras amount if we have detailed breakdown and extraCharges > 0 */}
										{selectedBookingForDetails.extras &&
											selectedBookingForDetails.extras.length > 0 &&
											(selectedBookingForDetails.extraCharges ?? 0) > 0 && (
												<div className="flex items-center justify-between rounded bg-orange-50 px-3 py-2">
													<span className="font-medium text-orange-700 text-sm">
														Total Additional Charges:
													</span>
													<span className="font-bold text-orange-700 text-sm">
														+$
														{(
															selectedBookingForDetails.extraCharges || 0
														).toFixed(2)}
													</span>
												</div>
											)}
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
