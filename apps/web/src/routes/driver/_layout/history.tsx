import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { CalendarIcon, MapPinIcon, UsersIcon, DollarSignIcon, ClockIcon, UserIcon, PhoneIcon, MessageSquare, CarIcon, X, ChevronRight } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";
import { useGetDriverBookingsQuery } from "@/features/driver/_hooks/query/use-get-driver-bookings-query";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { BookingTypeBadge } from "@/components/booking-type-badge";
import { formatDistanceKm } from "@/utils/format";

export const Route = createFileRoute("/driver/_layout/history")({
	component: HistoryPage,
});

function HistoryPage() {
	// Check if mobile using window width
	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}, []);

	// State for active tab
	const [activeTab, setActiveTab] = useState("all");

	// State for selected trip details
	const [selectedTrip, setSelectedTrip] = useState<any>(null);

	// State for trip details dialog  
	const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
	const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any>(null);

	// Get real booking data (fetch all completed bookings)
	const { data: bookingsData, isLoading } = useGetDriverBookingsQuery({
		limit: 100, // Fetch more records to show full history
	});

	// Transform backend data to match frontend structure
	const trips = useMemo(() => {
		if (!bookingsData?.data) return [];

		return bookingsData.data.map((booking: any) => ({
			id: booking.id,
			customerName: booking.customerName,
			passengerCount: booking.passengerCount,
			car: booking.car,
			pickupAddress: booking.originAddress,
			destinationAddress: booking.destinationAddress,
			stops: booking.stops ? booking.stops.sort((a: any, b: any) => a.stopOrder - b.stopOrder) : [],
			scheduledTime: new Date(booking.scheduledPickupTime),
			completedTime: booking.serviceCompletedAt ? new Date(booking.serviceCompletedAt) : null,
			passengers: booking.passengerCount || 1,
			finalAmount: booking.driverShare ?? booking.finalAmount ?? (booking.quotedAmount || 0) + (booking.extraCharges || 0),
			distance: (booking.actualDistance ?? booking.estimatedDistance) != null ? formatDistanceKm(booking.actualDistance ?? booking.estimatedDistance) : "N/A",
			duration: (booking.estimatedDuration) ? `${Math.round(booking.estimatedDuration / 60)} min` : "N/A",
			status: booking.status as "completed" | "cancelled" | "no_show",
			// Pass through booking type and offload fields for badge
			bookingType: booking.bookingType,
			packageId: booking.packageId,
			package: booking.package,
			estimatedDuration: booking.estimatedDuration,
			offloadDetails: booking.offloadDetails
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
			customerName: booking.customerName || (booking.passengers ? `${booking.passengers} Passenger${booking.passengers > 1 ? 's' : ''}` : '1 Passenger'),
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
						<span className="text-sm font-semibold text-gray-900">Trip #{trip.id.slice(-6)}</span>
						<div className="flex items-center gap-2">
							<BookingTypeBadge booking={trip as any} />
							{trip.bookingType === 'offload' && trip.offloadDetails && (
								<Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
									{trip.offloadDetails.offloaderName}
								</Badge>
							)}
							<span className="text-xs text-gray-500">{format(trip.scheduledTime, "MMM dd 'at' h:mm a")}</span>
						</div>
					</div>

					{/* Customer, Pax, and Vehicle info */}
					<div className="space-y-2 mb-3">
						{/* First row: Customer and Pax */}
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1.5 text-xs text-gray-600">
								<UserIcon className="h-3.5 w-3.5 text-gray-500" />
								<span className="font-medium">{(trip as any).customerName}</span>
							</div>
							<div className="flex items-center gap-1 text-xs text-gray-600">
								<UsersIcon className="h-3.5 w-3.5 text-gray-500" />
								<span className="font-medium">{(trip as any).passengerCount || 1} pax</span>
							</div>
						</div>
						{/* Second row: Vehicle info (if available) */}
						{((trip as any).car?.name || (trip as any).assignedCar?.name || (trip as any).carName) && (
							<div className="flex items-center gap-1 text-xs text-gray-600">
								<CarIcon className="h-3.5 w-3.5 text-gray-500" />
								<span className="font-medium">
									{(trip as any).car?.name || (trip as any).assignedCar?.name || (trip as any).carName}
								</span>
							</div>
						)}
					</div>

					<div className="flex items-center justify-between">
						{/* Left side - Route info */}
						<div className="flex-1 min-w-0 space-y-2">
							{/* Route - Pickup to Drop-off */}
							<div className="space-y-2">
								<div className="flex items-start gap-2">
									<div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
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
						<ChevronRight className="w-5 h-5 text-gray-400" />
					</div>

					{/* Offloader Details Section */}
					{trip.bookingType === 'offload' && trip.offloadDetails && (
						<div className="mt-3 pt-3 border-t border-gray-100">
							<div className="bg-orange-50 rounded-md p-2 border border-orange-100">
								<div className="flex items-center gap-1 mb-1">
									<CarIcon className="h-3 w-3 text-orange-600" />
									<span className="text-xs font-semibold text-orange-800">Offload Booking</span>
								</div>
								<div className="space-y-1">
									<div className="text-xs text-orange-700">
										<span className="font-medium">Company:</span> {trip.offloadDetails.offloaderName}
									</div>
									<div className="text-xs text-orange-700">
										<span className="font-medium">Job Type:</span> {trip.offloadDetails.jobType}
									</div>
									<div className="text-xs text-orange-700">
										<span className="font-medium">Vehicle:</span> {trip.offloadDetails.vehicleType}
									</div>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		);
	};

	const EmptyState = ({ title, description }: { title: string; description: string }) => (
		<div className="flex flex-col items-center justify-center py-12">
			<ClockIcon className="w-16 h-16 text-gray-300 mb-4" />
			<h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
			<p className="text-gray-500 text-center">{description}</p>
		</div>
	);

	const renderTripsWithDateGroups = (tripsList: any[]) => {
		const groupedTrips = groupTripsByDate(tripsList);

		if (isLoading) {
			return (
				<div className="flex flex-col items-center justify-center py-12">
					<div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
					<p className="text-gray-500 text-center">Loading trip history...</p>
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
						<div className={cn(
							"sticky top-0 bg-gray-50 z-10 font-medium text-gray-900",
							isMobile ? "px-4 py-2 text-sm border-b border-gray-200" : "px-3 py-2 text-base rounded-lg"
						)}>
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
				{isMobile && (
					<div className="h-20"></div>
				)}
			</div>
		);
	};

	return (
		<div className={cn(
			isMobile ? "min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden" : "space-y-6 max-w-4xl mx-auto p-4"
		)}>
			{/* Header */}
			<div className={cn(
				"bg-white flex-shrink-0",
				isMobile ? "px-4 py-3 border-b border-gray-200" : "rounded-lg p-4 border border-gray-200"
			)}>
				<h1 className={cn(
					"font-bold text-gray-900",
					isMobile ? "text-lg" : "text-2xl"
				)}>History</h1>
				<p className="text-gray-600 text-sm">View all your past trips and earnings</p>
			</div>

			{/* Tabs */}
			<div className={cn(isMobile ? "flex-1 overflow-y-auto" : "")}>
				{isMobile ? (
					// Mobile: Custom tab design with state management
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
					// Desktop: Use shadcn Tabs component
					<Tabs defaultValue="all" className="w-full">
						<TabsList className="grid w-full grid-cols-3 h-12">
							<TabsTrigger value="all">All Jobs ({trips.length})</TabsTrigger>
							<TabsTrigger value="completed">Completed ({completedTrips.length})</TabsTrigger>
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

			{/* Trip Details Dialog (same as trips.tsx) */}
			<Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
				<DialogContent
					showCloseButton={!isMobile}
					className={cn(
						isMobile ? "max-w-full w-full h-full m-0 rounded-none p-0 bg-gray-50" : "max-w-md bg-gray-50"
					)}
				>
					{selectedBookingForDetails && (
						<div className={cn(
							isMobile ? "flex flex-col h-full" : "flex flex-col"
						)}>
							{/* Compact Header with gradient background */}
							<div className={cn(
								"bg-gradient-to-r from-primary to-primary/80 text-white p-4 flex-shrink-0",
								isMobile ? "pt-6" : ""
							)}>
								<div className="flex items-center gap-3">
									<ClockIcon className="h-5 w-5 text-white/80" />
									<div>
										<h2 className="text-lg font-bold">
											{format(new Date(selectedBookingForDetails.scheduledPickupTime), "MMM dd, yyyy 'at' HH:mm")}
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

								{/* Close button */}
								<Button
									variant="ghost"
									size="sm"
									className="absolute top-2 right-2 text-white hover:text-white hover:bg-white/20 bg-black/20 backdrop-blur-sm h-8 w-8 p-0 rounded-full shadow-lg"
									onClick={() => setBookingDetailsOpen(false)}
								>
									<X className="h-5 w-5" />
								</Button>
							</div>

							{/* Scrollable Content */}
							<div className={cn(
								"flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50",
								isMobile ? "pb-20" : ""
							)}>
								{/* Route Information */}
								<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
									<h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
										<MapPinIcon className="h-4 w-4 text-primary" />
										Route Details
									</h3>
									<div className="space-y-3">
										{/* Pick up */}
										<div className="flex items-start gap-2">
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

										{/* Drop off */}
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

								{/* Customer Information */}
								<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
									<h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
										<UserIcon className="h-4 w-4 text-primary" />
										Customer Details
									</h3>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0">
											<UserIcon className="h-5 w-5 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-semibold text-sm text-gray-900 truncate">{selectedBookingForDetails.customerName}</p>
											{selectedBookingForDetails.customerPhone && (
												<p className="text-xs text-gray-600">{selectedBookingForDetails.customerPhone}</p>
											)}
										</div>
									</div>
								</div>

								{/* Offloader Details */}
								{selectedBookingForDetails.bookingType === 'offload' && selectedBookingForDetails.offloadDetails && (
									<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
										<h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
											<CarIcon className="h-4 w-4 text-orange-600" />
											Offload Booking Details
										</h3>
										<div className="bg-orange-50 rounded-lg p-3 space-y-2">
											<div>
												<span className="text-xs text-orange-600 font-medium">Company:</span>
												<p className="text-sm text-orange-800 font-medium">{selectedBookingForDetails.offloadDetails.offloaderName}</p>
											</div>
											<div>
												<span className="text-xs text-orange-600 font-medium">Job Type:</span>
												<p className="text-sm text-orange-800">{selectedBookingForDetails.offloadDetails.jobType}</p>
											</div>
											<div>
												<span className="text-xs text-orange-600 font-medium">Vehicle Type:</span>
												<p className="text-sm text-orange-800">{selectedBookingForDetails.offloadDetails.vehicleType}</p>
											</div>
										</div>
									</div>
								)}

								{/* Special Requests */}
								{selectedBookingForDetails.specialRequests && (
									<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
										<h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
											<MessageSquare className="h-4 w-4 text-blue-600" />
											Special Requests
										</h3>
										<div className="bg-blue-50 rounded-lg p-3">
											<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
												{selectedBookingForDetails.specialRequests}
											</p>
										</div>
									</div>
								)}

								{/* Additional Notes */}
								{selectedBookingForDetails.additionalNotes && (
									<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
										<h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
											<MessageSquare className="h-4 w-4 text-orange-600" />
											Additional Notes
										</h3>
										<div className="bg-orange-50 rounded-lg p-3">
											<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
												{selectedBookingForDetails.additionalNotes}
											</p>
										</div>
									</div>
								)}

								{/* Your Share - driver only sees their commission (excludes toll/parking, includes waiting) */}
								<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
									<h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
										<DollarSignIcon className="h-4 w-4 text-primary" />
										Your Share
									</h3>
									<div className="space-y-2">
										<div className="flex justify-between items-center">
											<span className="text-base font-bold text-gray-900">Earnings:</span>
											<span className="text-lg font-bold text-gray-900">
												${(selectedBookingForDetails.driverShare ?? selectedBookingForDetails.finalAmount ?? (selectedBookingForDetails.quotedAmount || 0) + (selectedBookingForDetails.extraCharges || 0)).toFixed(2)}
											</span>
										</div>
										{/* Extras breakdown - only shown when driver has access to full data (e.g. before masking) */}
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
																		+${waitingTimeCharge.toFixed(2)}
																	</span>
																</div>
															)}
															{extras.map((extra: any, index: number) => (
																<div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
																	{extra.additionalWaitTime > 0 && (
																		<div className="flex items-center justify-between">
																			<span className="text-xs text-gray-600">Additional Wait Time:</span>
																			<span className="text-xs font-semibold text-amber-600">
																				{extra.additionalWaitTime} minutes
																			</span>
																		</div>
																	)}
																	{extra.unscheduledStops > 0 && (
																		<div className="flex items-center justify-between">
																			<span className="text-xs text-gray-600">Unscheduled Stops:</span>
																			<span className="text-xs font-semibold text-blue-600">
																				+${(extra.unscheduledStops || 0).toFixed(2)}
																			</span>
																		</div>
																	)}
																	{(extra.parkingCharges ?? 0) > 0 && (
																		<div className="flex items-center justify-between">
																			<span className="text-xs text-gray-600">Parking Charges:</span>
																			<span className="text-xs font-semibold text-purple-600">
																				+${(extra.parkingCharges || 0).toFixed(2)}
																			</span>
																		</div>
																	)}
																	{(extra.tollCharges ?? 0) > 0 && (
																		<div className="flex items-center justify-between">
																			<span className="text-xs text-gray-600">
																				Toll Charges{extra.tollLocation ? ` (${extra.tollLocation})` : ''}:
																			</span>
																			<span className="text-xs font-semibold text-orange-600">
																				+${(extra.tollCharges || 0).toFixed(2)}
																			</span>
																		</div>
																	)}
																	{(extra.otherChargesAmount ?? 0) > 0 && (
																		<div className="space-y-1">
																			<div className="flex items-center justify-between">
																				<span className="text-xs text-gray-600">Other Charges:</span>
																				<span className="text-xs font-semibold text-red-600">
																					+${(extra.otherChargesAmount || 0).toFixed(2)}
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
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Additional Charges:</span>
												<span className="text-sm font-semibold text-orange-600">
													+${(selectedBookingForDetails.extraCharges || 0).toFixed(2)}
												</span>
											</div>
										)}

										{/* Show total extras amount if we have detailed breakdown */}
										{selectedBookingForDetails.extras && selectedBookingForDetails.extras.length > 0 && (
											<div className="flex justify-between items-center bg-orange-50 px-3 py-2 rounded">
												<span className="text-sm font-medium text-orange-700">Total Additional Charges:</span>
												<span className="text-sm font-bold text-orange-700">
													+${(selectedBookingForDetails.extraCharges || 0).toFixed(2)}
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
