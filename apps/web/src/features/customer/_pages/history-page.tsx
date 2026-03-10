import { useState, useMemo } from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Calendar, Package, Car, Clock, MapPin, Users, CheckCircle, AlertTriangle, ArrowRightIcon, Loader2, Star, DollarSign, X, ChevronRight, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";
import { useUnifiedUserBookingsQuery } from "@/hooks/query/use-unified-user-bookings-query";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { BookingTypeBadge } from "@/components/booking-type-badge";

export function CustomerHistoryPage() {
	// Check if mobile using window width
	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}, []);

	// State for selected trip details
	const [selectedTrip, setSelectedTrip] = useState<any>(null);

	// State for trip details dialog
	const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
	const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any>(null);

	// State for active tab
	const [activeTab, setActiveTab] = useState<"all" | "completed" | "cancelled">("all");

	// Get real booking data (fetch all completed bookings)
	const { data: bookingsData, isLoading } = useUnifiedUserBookingsQuery({
		limit: 100, // Fetch more records to show full history
		offset: 0,
	});

	// Transform backend data to match frontend structure
	const trips = useMemo(() => {
		if (!bookingsData?.data) return [];

		return bookingsData.data.map((booking: any) => ({
			id: booking.id,
			pickupAddress: booking.originAddress,
			destinationAddress: booking.destinationAddress,
			stops: booking.stops ? booking.stops.sort((a: any, b: any) => a.stopOrder - b.stopOrder) : [],
			scheduledTime: new Date(booking.scheduledPickupTime),
			completedTime: booking.serviceCompletedAt ? new Date(booking.serviceCompletedAt) : null,
			passengers: booking.passengerCount || 1,
			finalAmount: booking.finalAmount ?? (booking.quotedAmount || 0) + (booking.extraCharges || 0),
			distance: "N/A", // Customer history doesn't track distance
			duration: "N/A", // Customer history doesn't track duration
			status: booking.status as "completed" | "cancelled" | "no_show",
			bookingType: booking.bookingType,
			packageId: booking.packageId
		})).filter(trip => ['completed', 'cancelled', 'no_show'].includes(trip.status));
	}, [bookingsData]);

	const completedTrips = trips.filter(trip => trip.status === "completed" || trip.status === "no_show");
	const cancelledTrips = trips.filter(trip => trip.status === "cancelled");

	// Handle trip click to show details
	const handleTripClick = (trip: any) => {
		setSelectedTrip(trip);
		handleOpenBookingDetails(trip);
	};

	// Handle opening booking details dialog (same as trips.tsx)
	const handleOpenBookingDetails = (booking: any) => {
		// Convert trip data structure to booking data structure for the dialog
		// Note: We need to get the original booking data to access extraCharges and extras
		const originalBooking = bookingsData?.data?.find((b: any) => b.id === booking.id);

		// Debug logging
		console.log("DEBUG: Original booking data:", originalBooking);
		console.log("DEBUG: Extras data:", (originalBooking as any)?.extras);

		const bookingData = {
			id: booking.id,
			scheduledPickupTime: booking.scheduledTime,
			originAddress: booking.pickupAddress,
			destinationAddress: booking.destinationAddress,
			stops: booking.stops || [],
			customerName: booking.passengers ? `${booking.passengers} Passenger${booking.passengers > 1 ? 's' : ''}` : '1 Passenger',
			customerPhone: null, // History doesn't have phone data
			status: booking.status,
			finalAmount: booking.finalAmount,
			quotedAmount: originalBooking?.quotedAmount || booking.finalAmount, // Use original quoted amount
			amount: booking.finalAmount,
			totalAmount: booking.finalAmount,
			extraCharges: originalBooking?.extraCharges || 0, // Get extraCharges from original booking
			extras: (originalBooking as any)?.extras || [], // Get extras breakdown from original booking
			car: null // TODO: Add car information to history data
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
		const sortedDates = Object.keys(grouped).sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());

		const result: Array<{ date: string; trips: typeof trips }> = [];
		sortedDates.forEach(date => {
			result.push({
				date,
				trips: grouped[date].sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
			});
		});

		return result;
	};

	const TripCard = ({ trip, onClick }: { trip: typeof trips[0], onClick?: () => void }) => {
		return (
			<Card
				className={cn(
					"bg-white transition-colors w-full overflow-hidden cursor-pointer hover:shadow-md",
					isMobile ? "border-0 border-b border-gray-200 rounded-none shadow-none" : "border border-gray-200 shadow-sm"
				)}
				onClick={onClick}
			>
				<CardContent className={cn("min-w-0 w-full overflow-x-hidden", isMobile ? "px-4 py-3" : "p-4")}>
					{/* Booking ID and Date/Time */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold text-gray-900">Trip #{trip.id.slice(-6)}</span>
							<BookingTypeBadge booking={trip} />
						</div>
						<div className="flex items-center gap-2">
							<Badge
								variant={trip.status === 'completed' ? 'default' :
								        trip.status === 'cancelled' ? 'destructive' : 'outline'}
								className="text-xs px-2 py-0.5"
							>
								{trip.status.replace('_', ' ').toUpperCase()}
							</Badge>
							<span className="text-xs text-gray-500">{format(trip.scheduledTime, "MMM dd 'at' h:mm a")}</span>
						</div>
					</div>

					<div className="flex items-center justify-between">
						{/* Left side - Route info */}
						<div className="flex-1 min-w-0 space-y-2">
							{/* Route - Pickup to Drop-off */}
							<div className="space-y-2">
								<div className="flex items-start gap-2">
									<div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
									<p className="text-xs text-gray-600 leading-tight">
										{trip.pickupAddress
											? isMobile
												? trip.pickupAddress.length > 35
													? trip.pickupAddress.substring(0, 35) + '...'
													: trip.pickupAddress
												: trip.pickupAddress
											: 'Pickup location unavailable'
										}
									</p>
								</div>

								{/* Stops (if any) */}
								{trip.stops && trip.stops.length > 0 && (
									<div className="flex items-start gap-2">
										<div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
										<p className="text-xs text-blue-600 leading-tight">
											{trip.stops.length} stop{trip.stops.length > 1 ? 's' : ''}
										</p>
									</div>
								)}

								<div className="flex items-start gap-2">
									<div className="w-2 h-2 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
									<p className="text-xs text-gray-600 leading-tight">
										{trip.destinationAddress
											? isMobile
												? trip.destinationAddress.length > 35
													? trip.destinationAddress.substring(0, 35) + '...'
													: trip.destinationAddress
												: trip.destinationAddress
											: 'Destination unavailable'
										}
									</p>
								</div>
							</div>
						</div>

						{/* Right side - Amount and Arrow */}
						<div className="flex items-center gap-2 flex-shrink-0 ml-4">
							<span className="text-sm font-semibold text-gray-900">{formatPrice(trip.finalAmount)}</span>
							<ChevronRight className="h-4 w-4 text-gray-400" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	};

	// Helper functions
	const formatPrice = (priceInDollars: number) => `$${priceInDollars.toFixed(2)}`;

	// Render function for trips with date groups (same as driver history)
	const renderTripsWithDateGroups = (tripsList: typeof trips) => {
		const groupedTrips = groupTripsByDate(tripsList);

		if (groupedTrips.length === 0) {
			return (
				<div className={cn(
					"flex items-center justify-center h-full py-12",
					isMobile ? "px-4" : ""
				)}>
					<div className="text-center">
						<Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-gray-900 mb-2">No trips found</h3>
						<p className="text-gray-600 text-sm">You don't have any trips in this category yet.</p>
					</div>
				</div>
			);
		}

		return (
			<div className={cn("space-y-6", isMobile ? "" : "")}>
				{groupedTrips.map((group) => (
					<div key={group.date}>
						{/* Date Header */}
						<div className="flex items-center gap-3 mb-4">
							<h3 className="text-lg font-semibold text-gray-900">
								{format(new Date(group.date), "EEEE, do MMMM yyyy")}
							</h3>
							<div className="flex-1 h-px bg-gray-200"></div>
						</div>

						{/* Trips for this date */}
						<div className={cn(
							"space-y-0",
							isMobile ? "" : "space-y-3"
						)}>
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
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	return (
		<div className="w-full h-full flex flex-col">
			{/* Header */}
			<div className={cn(
				"bg-white border-b border-gray-200 flex-shrink-0",
				isMobile ? "px-4 py-3" : "px-6 py-4"
			)}>
				<div className="flex items-center justify-between">
					<div>
						<h1 className={cn(
							"font-bold text-gray-900",
							isMobile ? "text-lg" : "text-2xl"
						)}>History</h1>
						<p className="text-gray-600 text-xs">View all your past trips and earnings</p>
					</div>
				</div>
			</div>

			{/* Main Content - Using trips page tab design */}
			<div className={cn(isMobile ? "flex-1 overflow-y-auto" : "px-6 py-4")}>
				{isMobile ? (
					// Mobile: Custom tab design matching trips page
					<>
						{/* Mobile Tab Headers */}
						<div className="bg-white border-b border-gray-200 sticky top-0 z-20">
							<div className="flex w-full">
								<button
									onClick={() => setActiveTab("all")}
									className={cn(
										"flex-1 py-3 px-1 text-xs font-medium text-center border-b-2 transition-all duration-200 min-w-0",
										activeTab === "all"
											? "border-primary text-primary bg-primary/5"
											: "border-transparent text-gray-600 hover:text-gray-900"
									)}
								>
									<span className="truncate">All ({trips.length})</span>
								</button>
								<button
									onClick={() => setActiveTab("completed")}
									className={cn(
										"flex-1 py-3 px-1 text-xs font-medium text-center border-b-2 transition-all duration-200 min-w-0",
										activeTab === "completed"
											? "border-primary text-primary bg-primary/5"
											: "border-transparent text-gray-600 hover:text-gray-900"
									)}
								>
									<span className="truncate">Done ({completedTrips.length})</span>
								</button>
								<button
									onClick={() => setActiveTab("cancelled")}
									className={cn(
										"flex-1 py-3 px-1 text-xs font-medium text-center border-b-2 transition-all duration-200 min-w-0",
										activeTab === "cancelled"
											? "border-primary text-primary bg-primary/5"
											: "border-transparent text-gray-600 hover:text-gray-900"
									)}
								>
									<span className="truncate">Cancelled ({cancelledTrips.length})</span>
								</button>
							</div>
						</div>

						{/* Mobile Tab Content */}
						<div className="flex-1">
							{activeTab === "all" && renderTripsWithDateGroups(trips)}
							{activeTab === "completed" && renderTripsWithDateGroups(completedTrips)}
							{activeTab === "cancelled" && renderTripsWithDateGroups(cancelledTrips)}
						</div>
					</>
				) : (
					// Desktop: Use shadcn Tabs component matching trips page
					<Tabs defaultValue="all" className="w-full">
						<TabsList className="grid w-full grid-cols-3 h-12">
							<TabsTrigger value="all">All ({trips.length})</TabsTrigger>
							<TabsTrigger value="completed">Done ({completedTrips.length})</TabsTrigger>
							<TabsTrigger value="cancelled">Cancelled ({cancelledTrips.length})</TabsTrigger>
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
					showCloseButton={!isMobile}
					className={cn(
						isMobile ? "max-w-full w-full h-full m-0 rounded-none p-0 bg-gray-50 flex flex-col" : "max-w-md bg-gray-50"
					)}
				>
					{selectedBookingForDetails && (
						<div className={cn(
							isMobile ? "flex flex-col h-full" : "flex flex-col"
						)}>
							{/* Header */}
							<div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary to-primary/80 text-white flex-shrink-0">
								<div className="flex items-center gap-3">
									<Clock className="h-5 w-5 text-white/80" />
									<div>
										<h2 className="text-lg font-bold">
											{format(new Date(selectedBookingForDetails.scheduledPickupTime), "MMM dd, yyyy h:mm a")}
										</h2>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-xs text-white/80">
												Trip ID: {selectedBookingForDetails.id.slice(-6).toUpperCase()}
											</span>
											<Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-0.5">
												{selectedBookingForDetails.status.replace('_', ' ').toUpperCase()}
											</Badge>
										</div>
									</div>
								</div>

								<Button
									variant="ghost"
									size="lg"
									className="h-12 w-12 p-0 text-white hover:bg-white/20 rounded-full flex-shrink-0 border-2 border-white/30 hover:border-white/50 transition-all duration-200"
									onClick={() => setBookingDetailsOpen(false)}
								>
									<X className="h-6 w-6" />
								</Button>
							</div>

							{/* Content */}
							<div className={cn(
								"flex-1 p-4 space-y-4",
								isMobile ? "overflow-y-auto flex-grow min-h-0" : ""
							)}>
								{/* Route Details */}
								<div className="bg-white rounded-lg p-4 border">
									<h3 className="font-semibold text-gray-900 mb-3">Route</h3>
									<div className="space-y-3">
										<div className="flex items-start gap-3">
											<div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
											<div className="flex-1 min-w-0">
												<p className="text-xs font-medium text-green-700 mb-0.5">Pick up</p>
												<p className="text-xs text-gray-600 leading-tight break-words line-clamp-2">
													{selectedBookingForDetails.originAddress}
												</p>
											</div>
										</div>

										{/* Stops (if any) */}
										{selectedBookingForDetails.stops && selectedBookingForDetails.stops.length > 0 && (
											<>
												{selectedBookingForDetails.stops.map((stop: any, index: number) => (
													<div key={stop.id || index}>
														<div className="border-l border-gray-200 ml-1 h-2"></div>
														<div className="flex items-start gap-2">
															<div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
															<div className="flex-1 min-w-0">
																<p className="text-xs font-medium text-blue-700 mb-0.5">Stop {index + 1}</p>
																<p className="text-xs text-gray-600 leading-tight break-words line-clamp-2">
																	{stop.address}
																</p>
															</div>
														</div>
													</div>
												))}
											</>
										)}

										<div className="border-l border-gray-200 ml-1 h-2"></div>

										<div className="flex items-start gap-2">
											<div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
											<div className="flex-1 min-w-0">
												<p className="text-xs font-medium text-red-700 mb-0.5">Drop off</p>
												<p className="text-xs text-gray-600 leading-tight break-words line-clamp-2">
													{selectedBookingForDetails.destinationAddress}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Trip Fare */}
								<div className="bg-white rounded-lg p-4 border">
									<h3 className="font-semibold text-gray-900 mb-3">Trip Fare</h3>
									<div className="space-y-2">
										{/* Base trip fare */}
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-600">Base Trip Fare:</span>
											<span className="text-sm font-semibold">
												{formatPrice(selectedBookingForDetails.quotedAmount || 0)}
											</span>
										</div>

										{/* Extras breakdown if any */}
										{selectedBookingForDetails.extras && selectedBookingForDetails.extras.length > 0 && (
											<div className="space-y-2">
												<div className="text-sm font-medium text-gray-700 mt-3 mb-2">Extra Charges:</div>
												{(() => {
													const extras = selectedBookingForDetails.extras;
													const totalTolls = extras.reduce((s: number, e: any) => s + (e.tollCharges ?? 0), 0);
													const totalParking = extras.reduce((s: number, e: any) => s + (e.parkingCharges ?? 0), 0);
													const totalOther = extras.reduce((s: number, e: any) => s + (e.otherChargesAmount ?? 0), 0);
													const extraTotal = selectedBookingForDetails.extraCharges ?? 0;
													const waitingTimeCharge = Math.max(0, extraTotal - totalTolls - totalParking - totalOther);
													return (
														<>
															{waitingTimeCharge > 0 && (
																<div className="flex items-center justify-between bg-amber-50 px-3 py-2 rounded mb-2">
																	<span className="text-xs text-gray-600">Waiting Time Charge:</span>
																	<span className="text-xs font-semibold text-amber-600">
																		+{formatPrice(waitingTimeCharge)}
																	</span>
																</div>
															)}
															{extras.map((extra: any, index: number) => (
																<div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
																	{(extra.additionalWaitTime ?? 0) > 0 && (
																		<div className="flex items-center justify-between">
																			<span className="text-xs text-gray-600">Additional Wait Time:</span>
																			<span className="text-xs font-semibold text-amber-600">
																				{extra.additionalWaitTime} minutes
																			</span>
																		</div>
																	)}
																	{(extra.unscheduledStops ?? 0) > 0 && (
																		<div className="flex items-center justify-between">
																			<span className="text-xs text-gray-600">Unscheduled Stops:</span>
																			<span className="text-xs font-semibold text-blue-600">
																				+{formatPrice(extra.unscheduledStops)}
																			</span>
																		</div>
																	)}
																	{(extra.parkingCharges ?? 0) > 0 && (
																		<div className="flex items-center justify-between">
																			<span className="text-xs text-gray-600">Parking Charges:</span>
																			<span className="text-xs font-semibold text-purple-600">
																				+{formatPrice(extra.parkingCharges)}
																			</span>
																		</div>
																	)}
																	{(extra.tollCharges ?? 0) > 0 && (
																		<div className="flex items-center justify-between">
																			<span className="text-xs text-gray-600">
																				Toll Charges{extra.tollLocation ? ` (${extra.tollLocation})` : ''}:
																			</span>
																			<span className="text-xs font-semibold text-orange-600">
																				+{formatPrice(extra.tollCharges)}
																			</span>
																		</div>
																	)}
																	{(extra.otherChargesAmount ?? 0) > 0 && (
																		<div className="space-y-1">
																			<div className="flex items-center justify-between">
																				<span className="text-xs text-gray-600">Other Charges:</span>
																				<span className="text-xs font-semibold text-red-600">
																					+{formatPrice(extra.otherChargesAmount)}
																				</span>
																			</div>
																			{extra.otherChargesDescription && (
																				<p className="text-xs text-gray-500 italic">
																					{extra.otherChargesDescription}
																				</p>
																			)}
																		</div>
																	)}
																	{extra.notes && (
																		<div className="pt-1 border-t border-gray-200">
																			<p className="text-xs text-gray-500">
																				<span className="font-medium">Notes:</span> {extra.notes}
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
										{(!selectedBookingForDetails.extras || selectedBookingForDetails.extras.length === 0) &&
										 (selectedBookingForDetails.extraCharges && selectedBookingForDetails.extraCharges > 0) && (
											<div className="flex items-center justify-between">
												<span className="text-sm text-gray-600">Additional Charges:</span>
												<span className="text-sm font-semibold text-orange-600">
													+{formatPrice(selectedBookingForDetails.extraCharges)}
												</span>
											</div>
										)}

										{/* Show total extras amount if we have detailed breakdown */}
										{selectedBookingForDetails.extras && selectedBookingForDetails.extras.length > 0 && (
											<div className="flex items-center justify-between bg-orange-50 px-3 py-2 rounded">
												<span className="text-sm font-medium text-orange-700">Total Additional Charges:</span>
												<span className="text-sm font-bold text-orange-700">
													+{formatPrice(selectedBookingForDetails.extraCharges || 0)}
												</span>
											</div>
										)}

										{/* Divider if there are extras */}
										{((selectedBookingForDetails.extras && selectedBookingForDetails.extras.length > 0) ||
										  (selectedBookingForDetails.extraCharges && selectedBookingForDetails.extraCharges > 0)) && (
											<div className="border-t border-gray-200"></div>
										)}
									</div>
								</div>

								{/* Special Requests */}
								{selectedBookingForDetails.specialRequests && (
									<div className="bg-white rounded-lg p-4 border">
										<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
											<MessageSquare className="h-4 w-4 text-blue-600" />
											Special Requests
										</h3>
										<div className="bg-blue-50 rounded-lg p-3">
											<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
												{selectedBookingForDetails.specialRequests}
											</p>
										</div>
									</div>
								)}

								{/* Additional Notes */}
								{selectedBookingForDetails.additionalNotes && (
									<div className="bg-white rounded-lg p-4 border">
										<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
											<MessageSquare className="h-4 w-4 text-orange-600" />
											Additional Notes
										</h3>
										<div className="bg-orange-50 rounded-lg p-3">
											<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
												{selectedBookingForDetails.additionalNotes}
											</p>
										</div>
									</div>
								)}

								{/* Final Invoice */}
								<div className="bg-white rounded-lg p-4 border">
									<h3 className="font-semibold text-gray-900 mb-3">Invoice</h3>
									<div className="space-y-2">

										{/* Total */}
										<div className="flex items-center justify-between">
											<span className="text-base font-bold text-gray-900">Total Paid:</span>
											<span className="text-lg font-bold text-gray-900">
												{formatPrice(selectedBookingForDetails.finalAmount ?? (selectedBookingForDetails.quotedAmount || 0) + (selectedBookingForDetails.extraCharges || 0))}
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