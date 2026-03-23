import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import {
	AlertTriangle,
	ArrowRightIcon,
	Calendar,
	Car,
	CheckCircle,
	ChevronRight,
	Clock,
	DollarSign,
	Loader2,
	MapPin,
	MessageSquare,
	Package,
	Star,
	Users,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BookingTypeBadge } from "@/components/booking-type-badge";
import { useUnifiedUserBookingsQuery } from "@/hooks/query/use-unified-user-bookings-query";
import { useUserQuery } from "@/hooks/query/use-user-query";

export function CustomerHistoryPage() {
	// Check if mobile using window width
	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		);
	}, []);

	// State for selected trip details
	const [selectedTrip, setSelectedTrip] = useState<any>(null);

	// State for trip details dialog
	const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
	const [selectedBookingForDetails, setSelectedBookingForDetails] =
		useState<any>(null);

	// State for active tab
	const [activeTab, setActiveTab] = useState<"all" | "completed" | "cancelled">(
		"all",
	);

	// Get real booking data (fetch all completed bookings)
	const { data: bookingsData, isLoading } = useUnifiedUserBookingsQuery({
		limit: 100, // Fetch more records to show full history
		offset: 0,
	});

	// Transform backend data to match frontend structure
	const trips = useMemo(() => {
		if (!bookingsData?.data) return [];

		return bookingsData.data
			.map((booking: any) => ({
				id: booking.id,
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
					booking.finalAmount ??
					(booking.quotedAmount || 0) + (booking.extraCharges || 0),
				distance: "N/A", // Customer history doesn't track distance
				duration: "N/A", // Customer history doesn't track duration
				status: booking.status as "completed" | "cancelled" | "no_show",
				bookingType: booking.bookingType,
				packageId: booking.packageId,
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
			customerName: booking.passengers
				? `${booking.passengers} Passenger${booking.passengers > 1 ? "s" : ""}`
				: "1 Passenger",
			customerPhone: null, // History doesn't have phone data
			status: booking.status,
			finalAmount: booking.finalAmount,
			quotedAmount: originalBooking?.quotedAmount || booking.finalAmount, // Use original quoted amount
			amount: booking.finalAmount,
			totalAmount: booking.finalAmount,
			extraCharges: originalBooking?.extraCharges || 0, // Get extraCharges from original booking
			extras: (originalBooking as any)?.extras || [], // Get extras breakdown from original booking
			car: null, // TODO: Add car information to history data
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
						<div className="flex items-center gap-2">
							<span className="font-semibold text-gray-900 text-sm">
								Trip #{trip.id.slice(-6)}
							</span>
							<BookingTypeBadge booking={trip} />
						</div>
						<div className="flex items-center gap-2">
							<Badge
								variant={
									trip.status === "completed"
										? "default"
										: trip.status === "cancelled"
											? "destructive"
											: "outline"
								}
								className="px-2 py-0.5 text-xs"
							>
								{trip.status.replace("_", " ").toUpperCase()}
							</Badge>
							<span className="text-gray-500 text-xs">
								{format(trip.scheduledTime, "MMM dd 'at' h:mm a")}
							</span>
						</div>
					</div>

					<div className="flex items-center justify-between">
						{/* Left side - Route info */}
						<div className="min-w-0 flex-1 space-y-2">
							{/* Route - Pickup to Drop-off */}
							<div className="space-y-2">
								<div className="flex items-start gap-2">
									<div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
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

								{/* Stops (if any) */}
								{trip.stops && trip.stops.length > 0 && (
									<div className="flex items-start gap-2">
										<div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
										<p className="text-blue-600 text-xs leading-tight">
											{trip.stops.length} stop{trip.stops.length > 1 ? "s" : ""}
										</p>
									</div>
								)}

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

						{/* Right side - Amount and Arrow */}
						<div className="ml-4 flex flex-shrink-0 items-center gap-2">
							<span className="font-semibold text-gray-900 text-sm">
								{formatPrice(trip.finalAmount)}
							</span>
							<ChevronRight className="h-4 w-4 text-gray-400" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	};

	// Helper functions
	const formatPrice = (priceInDollars: number) =>
		`$${priceInDollars.toFixed(2)}`;

	// Render function for trips with date groups (same as driver history)
	const renderTripsWithDateGroups = (tripsList: typeof trips) => {
		const groupedTrips = groupTripsByDate(tripsList);

		if (groupedTrips.length === 0) {
			return (
				<div
					className={cn(
						"flex h-full items-center justify-center py-12",
						isMobile ? "px-4" : "",
					)}
				>
					<div className="text-center">
						<Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
						<h3 className="mb-2 font-semibold text-gray-900 text-lg">
							No trips found
						</h3>
						<p className="text-gray-600 text-sm">
							You don't have any trips in this category yet.
						</p>
					</div>
				</div>
			);
		}

		return (
			<div className={cn("space-y-6", isMobile ? "" : "")}>
				{groupedTrips.map((group) => (
					<div key={group.date}>
						{/* Date Header */}
						<div className="mb-4 flex items-center gap-3">
							<h3 className="font-semibold text-gray-900 text-lg">
								{format(new Date(group.date), "EEEE, do MMMM yyyy")}
							</h3>
							<div className="h-px flex-1 bg-gray-200" />
						</div>

						{/* Trips for this date */}
						<div className={cn("space-y-0", isMobile ? "" : "space-y-3")}>
							{group.trips.map((trip) => (
								<TripCard
									key={trip.id}
									trip={trip}
									onClick={() => handleTripClick(trip)}
								/>
							))}
						</div>
					</div>
				))}
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col">
			{/* Header */}
			<div
				className={cn(
					"flex-shrink-0 border-gray-200 border-b bg-white",
					isMobile ? "px-4 py-3" : "px-6 py-4",
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
							History
						</h1>
						<p className="text-gray-600 text-xs">
							View all your past trips and earnings
						</p>
					</div>
				</div>
			</div>

			{/* Main Content - Using trips page tab design */}
			<div className={cn(isMobile ? "flex-1 overflow-y-auto" : "px-6 py-4")}>
				{isMobile ? (
					// Mobile: Custom tab design matching trips page
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
					// Desktop: Use shadcn Tabs component matching trips page
					<Tabs defaultValue="all" className="w-full">
						<TabsList className="grid h-12 w-full grid-cols-3">
							<TabsTrigger value="all">All ({trips.length})</TabsTrigger>
							<TabsTrigger value="completed">
								Done ({completedTrips.length})
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

			{/* Booking Details Dialog */}
			<Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
				<DialogContent
					showCloseButton={false}
					className={cn(
						isMobile
							? "m-0 flex h-full w-full max-w-full flex-col rounded-none bg-gray-50 p-0"
							: "max-w-md bg-gray-50",
					)}
				>
					{selectedBookingForDetails && (
						<div
							className={cn(
								isMobile ? "flex h-full flex-col" : "flex flex-col",
							)}
						>
							{/* Header */}
							<div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-br from-primary to-primary/80 p-4 text-white">
								<div className="flex items-center gap-3">
									<Clock className="h-5 w-5 text-white/80" />
									<div>
										<h2 className="font-bold text-lg">
											{format(
												new Date(selectedBookingForDetails.scheduledPickupTime),
												"MMM dd, yyyy h:mm a",
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

							{/* Content */}
							<div
								className={cn(
									"flex-1 space-y-4 p-4",
									isMobile ? "min-h-0 flex-grow overflow-y-auto" : "",
								)}
							>
								{/* Route Details */}
								<div className="rounded-lg border bg-white p-4">
									<h3 className="mb-3 font-semibold text-gray-900">Route</h3>
									<div className="space-y-3">
										<div className="flex items-start gap-3">
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

								{/* Trip Fare */}
								<div className="rounded-lg border bg-white p-4">
									<h3 className="mb-3 font-semibold text-gray-900">
										Trip Fare
									</h3>
									<div className="space-y-2">
										{/* Base trip fare */}
										<div className="flex items-center justify-between">
											<span className="text-gray-600 text-sm">
												Base Trip Fare:
											</span>
											<span className="font-semibold text-sm">
												{formatPrice(
													selectedBookingForDetails.quotedAmount || 0,
												)}
											</span>
										</div>

										{/* Extras breakdown if any - only show when there are non-zero charges */}
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
																			+{formatPrice(waitingTimeCharge)}
																		</span>
																	</div>
																)}
																{extras.map((extra: any, index: number) => (
																	<div
																		key={index}
																		className="space-y-2 rounded-lg bg-gray-50 p-3"
																	>
																		{(extra.additionalWaitTime ?? 0) > 0 && (
																			<div className="flex items-center justify-between">
																				<span className="text-gray-600 text-xs">
																					Additional Wait Time:
																				</span>
																				<span className="font-semibold text-amber-600 text-xs">
																					{extra.additionalWaitTime} minutes
																				</span>
																			</div>
																		)}
																		{(extra.unscheduledStops ?? 0) > 0 && (
																			<div className="flex items-center justify-between">
																				<span className="text-gray-600 text-xs">
																					Unscheduled Stops:
																				</span>
																				<span className="font-semibold text-blue-600 text-xs">
																					+{formatPrice(extra.unscheduledStops)}
																				</span>
																			</div>
																		)}
																		{(extra.parkingCharges ?? 0) > 0 && (
																			<div className="flex items-center justify-between">
																				<span className="text-gray-600 text-xs">
																					Parking Charges:
																				</span>
																				<span className="font-semibold text-purple-600 text-xs">
																					+{formatPrice(extra.parkingCharges)}
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
																					+{formatPrice(extra.tollCharges)}
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
																						+
																						{formatPrice(
																							extra.otherChargesAmount,
																						)}
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
														+
														{formatPrice(
															selectedBookingForDetails.extraCharges,
														)}
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
														+
														{formatPrice(
															selectedBookingForDetails.extraCharges || 0,
														)}
													</span>
												</div>
											)}

										{/* Divider if there are extra charges */}
										{(selectedBookingForDetails.extraCharges ?? 0) > 0 && (
											<div className="border-gray-200 border-t" />
										)}
									</div>
								</div>

								{/* Special Requests */}
								{selectedBookingForDetails.specialRequests && (
									<div className="rounded-lg border bg-white p-4">
										<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
											<MessageSquare className="h-4 w-4 text-blue-600" />
											Special Requests
										</h3>
										<div className="rounded-lg bg-blue-50 p-3">
											<p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
												{selectedBookingForDetails.specialRequests}
											</p>
										</div>
									</div>
								)}

								{/* Additional Notes */}
								{selectedBookingForDetails.additionalNotes && (
									<div className="rounded-lg border bg-white p-4">
										<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
											<MessageSquare className="h-4 w-4 text-orange-600" />
											Additional Notes
										</h3>
										<div className="rounded-lg bg-orange-50 p-3">
											<p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
												{selectedBookingForDetails.additionalNotes}
											</p>
										</div>
									</div>
								)}

								{/* Final Invoice */}
								<div className="rounded-lg border bg-white p-4">
									<h3 className="mb-3 font-semibold text-gray-900">Invoice</h3>
									<div className="space-y-2">
										{/* Total */}
										<div className="flex items-center justify-between">
											<span className="font-bold text-base text-gray-900">
												Total Paid:
											</span>
											<span className="font-bold text-gray-900 text-lg">
												{formatPrice(
													selectedBookingForDetails.finalAmount ??
														(selectedBookingForDetails.quotedAmount || 0) +
															(selectedBookingForDetails.extraCharges || 0),
												)}
											</span>
										</div>
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
