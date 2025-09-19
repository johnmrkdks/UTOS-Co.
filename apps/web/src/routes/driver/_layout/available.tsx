import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { MapPinIcon, ClockIcon, UsersIcon, DollarSignIcon, Loader2Icon, CheckCircleIcon, UserIcon, CarIcon, ArrowLeft, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { useDriverBookingsQuery } from "@/hooks/query/use-driver-bookings-query";
import { useUpdateBookingStatusMutation } from "@/features/dashboard/_pages/booking-management/_hooks/query/use-update-booking-status-mutation";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import { BookingTypeBadge } from "@/components/booking-type-badge";

export const Route = createFileRoute("/driver/_layout/available")({
	component: AvailableTripsPage,
});

function AvailableTripsPage() {
	// Memoize mobile detection to prevent re-evaluation during render
	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}, []);

	// State for trip details dialog
	const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
	const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any>(null);

	// State to track which trip is being started
	const [startingTripId, setStartingTripId] = useState<string | null>(null);

	// Get assigned trips for current driver
	const { data: assignedTripsData, isLoading: assignedLoading, error: assignedError } = useDriverBookingsQuery({
		limit: 50,
		filters: {
			status: "driver_assigned"
		}
	});

	const assignedTrips = (assignedTripsData?.data || []).sort((a, b) => {
		// Sort by closest scheduled pickup time (soonest first)
		return new Date(a.scheduledPickupTime).getTime() - new Date(b.scheduledPickupTime).getTime();
	});

	// Status update mutation
	const updateStatusMutation = useUpdateBookingStatusMutation();

	const handleStartTrip = async (tripId: string) => {
		try {
			setStartingTripId(tripId); // Track which trip is being started
			// Update trip status from 'driver_assigned' to 'driver_en_route'
			updateStatusMutation.mutate({
				id: tripId,
				status: 'driver_en_route' as any,
			}, {
				onSuccess: () => {
					setStartingTripId(null); // Clear loading state on success
					setBookingDetailsOpen(false); // Close dialog on success
				},
				onError: () => {
					setStartingTripId(null); // Clear loading state on error
					toast.error("Failed to start trip");
				}
			});
		} catch (error) {
			setStartingTripId(null); // Clear loading state on catch
			toast.error("Failed to start trip");
		}
	};

	const handleTripClick = (trip: any) => {
		setSelectedBookingForDetails(trip);
		setBookingDetailsOpen(true);
	};

	const TripCard = ({ trip }: { trip: any }) => {
		const formatCurrency = (amount: number) => amount.toFixed(2);
		const formatDistance = (meters: number) => (meters / 1000).toFixed(1);
		const formatDuration = (seconds: number) => Math.round(seconds / 60);

		// Better car name handling
		const getCarDisplayName = () => {
			if (trip.selectedCar?.name) return trip.selectedCar.name;

			const make = trip.selectedCar?.make;
			const model = trip.selectedCar?.model;

			if (make && model) return `${make} ${model}`;
			if (make) return make;
			if (model) return model;

			return `Booking #${trip.id.slice(-6).toUpperCase()}`;
		};

		const totalAmount = trip.quotedAmount || (trip.baseFare || 0) + (trip.distanceFare || 0) || 0;
		const stopsCount = trip.stops ? trip.stops.length : 0;

		return (
			<Card
				className={cn(
					"bg-white transition-colors cursor-pointer active:bg-gray-50",
					isMobile
						? "border-0 border-b border-gray-200 rounded-none shadow-none"
						: "border border-gray-200 shadow-sm hover:shadow-md"
				)}
				onClick={() => handleTripClick(trip)}
			>
				<CardContent className={cn(
					isMobile ? "px-4 py-4" : "p-4"
				)}>
					{isMobile ? (
						// Mobile optimized layout
						<>
							{/* Header - Time and ID */}
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<ClockIcon className="h-4 w-4 text-blue-500" />
									<div>
										<div className="flex items-center gap-2">
											<span className="text-lg font-bold text-gray-900">
												{format(new Date(trip.scheduledPickupTime), "h:mm a")}
											</span>
											<span className="text-xs text-gray-400 font-mono">
												#{trip.id.slice(-6)}
											</span>
										</div>
										<div className="text-xs text-gray-500">
											{format(new Date(trip.scheduledPickupTime), "MMM dd, yyyy")}
										</div>
									</div>
								</div>
								<Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-sm px-2 py-1">
									${formatCurrency(totalAmount)}
								</Badge>
							</div>

							{/* Type Badge and Distance */}
							<div className="flex items-center justify-between mb-3">
								<BookingTypeBadge booking={trip} />
								{trip.estimatedDistance && (
									<div className="flex items-center gap-2 text-xs text-gray-500">
										<span>{formatDistance(trip.estimatedDistance)}km</span>
										<span>•</span>
										<span>{formatDuration(trip.estimatedDuration || 0)}min</span>
									</div>
								)}
							</div>

							{/* Route - Ultra Compact Mobile Layout */}
							<div className="space-y-1.5 mb-3">
								{/* Origin */}
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
									<p className="text-xs text-gray-700 line-clamp-1 leading-tight">
										{trip.originAddress.length > 35
											? trip.originAddress.substring(0, 35) + '...'
											: trip.originAddress}
									</p>
								</div>

								{/* Stops (if any) */}
								{stopsCount > 0 && (
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
										<p className="text-xs text-blue-600 line-clamp-1 leading-tight">
											{stopsCount} stop{stopsCount > 1 ? 's' : ''}
										</p>
									</div>
								)}

								{/* Destination */}
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
									<p className="text-xs text-gray-700 line-clamp-1 leading-tight">
										{trip.destinationAddress.length > 35
											? trip.destinationAddress.substring(0, 35) + '...'
											: trip.destinationAddress}
									</p>
								</div>
							</div>

							{/* Customer, Pax, and Car - Compact Bottom Row */}
							<div className="flex items-center gap-2 pt-2 border-t border-gray-100">
								<div className="flex items-center gap-1 text-xs text-gray-600">
									<UserIcon className="h-3 w-3 text-gray-400" />
									<span className="font-medium truncate max-w-[80px]">{trip.customerName || 'Customer'}</span>
								</div>
								<div className="flex items-center gap-1 text-xs text-gray-600">
									<UsersIcon className="h-3 w-3 text-gray-400" />
									<span className="font-medium">{trip.passengerCount || 1}</span>
								</div>
								<div className="flex items-center gap-1 text-xs text-gray-600 flex-1 min-w-0">
									<CarIcon className="h-3 w-3 text-gray-400" />
									<span className="font-medium truncate">
										{trip.car?.name || trip.carName || trip.vehicleName || trip.vehicle?.name || 'Unassigned'}
									</span>
								</div>
							</div>
						</>
					) : (
						// Desktop layout (enhanced version of previous design)
						<>
							{/* Header with Time, Type, and Price */}
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<ClockIcon className="h-5 w-5 text-blue-500" />
									<div>
										<div className="flex items-center gap-2">
											<span className="text-xl font-bold text-gray-900">
												{format(new Date(trip.scheduledPickupTime), "h:mm a")}
											</span>
											<span className="text-xs text-gray-400 font-mono">
												#{trip.id.slice(-6)}
											</span>
										</div>
										<div className="text-sm text-gray-500">
											{format(new Date(trip.scheduledPickupTime), "MMM dd, yyyy")}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<BookingTypeBadge booking={trip} />
									<Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-lg px-4 py-2">
										${formatCurrency(totalAmount)}
									</Badge>
								</div>
							</div>

							{/* Distance and Duration */}
							{trip.estimatedDistance && (
								<div className="mb-4">
									<div className="flex items-center gap-3 text-sm text-gray-500">
										<span>{formatDistance(trip.estimatedDistance)}km</span>
										<span>•</span>
										<span>{formatDuration(trip.estimatedDuration || 0)}min</span>
									</div>
								</div>
							)}

							{/* Route */}
							<div className="space-y-3 mb-4">
								{/* Origin */}
								<div className="flex items-start gap-3">
									<div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 mb-1">Pickup</p>
										<p className="text-sm text-gray-600 break-words">{trip.originAddress}</p>
									</div>
								</div>

								{/* Stops (if any) */}
								{stopsCount > 0 && (
									<div className="flex items-start gap-3">
										<div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-blue-700 mb-1">Stops</p>
											<p className="text-sm text-blue-600">{stopsCount} intermediate stop{stopsCount > 1 ? 's' : ''}</p>
										</div>
									</div>
								)}

								{/* Destination */}
								<div className="flex items-start gap-3">
									<div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 mb-1">Drop-off</p>
										<p className="text-sm text-gray-600 break-words">{trip.destinationAddress}</p>
									</div>
								</div>
							</div>

							{/* Customer, Pax, and Car - Horizontal Layout */}
							<div className="flex items-center gap-6 pt-3 border-t border-gray-100">
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<UserIcon className="h-4 w-4 text-gray-400" />
									<span className="font-medium">{trip.customerName || 'Customer'}</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<UsersIcon className="h-4 w-4 text-gray-400" />
									<span className="font-medium">{trip.passengerCount || 1} pax</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<CarIcon className="h-4 w-4 text-gray-400" />
									<span className="font-medium">
										{trip.car?.name || trip.carName || trip.vehicleName || trip.vehicle?.name || 'Unassigned'}
									</span>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		);
	};

	const LoadingState = () => (
		<div className="flex items-center justify-center py-12">
			<Loader2Icon className="w-8 h-8 animate-spin text-gray-400" />
		</div>
	);

	const EmptyState = ({ title, description }: { title: string; description: string }) => (
		<div className="flex flex-col items-center justify-center py-12">
			<MapPinIcon className="w-16 h-16 text-gray-300 mb-4" />
			<h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
			<p className="text-gray-500 text-center">{description}</p>
		</div>
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
						)}>Available Trips</h1>
						<p className="text-gray-600 text-xs">Your assigned trips ready to start</p>
					</div>
				</div>
			</div>

			{/* Trips List */}
			<div className={cn(
				isMobile ? "flex-1 overflow-y-auto" : "space-y-4"
			)}>
				{assignedLoading ? (
					<div className={cn(
						"flex items-center justify-center h-full",
						isMobile ? "px-4" : ""
					)}>
						<LoadingState />
					</div>
				) : assignedError ? (
					<div className={cn(
						"flex items-center justify-center h-full",
						isMobile ? "px-4" : ""
					)}>
						<EmptyState
							title="Error Loading Trips"
							description="There was an error loading your assigned trips. Please try again."
						/>
					</div>
				) : assignedTrips.length === 0 ? (
					<div className={cn(
						"flex items-center justify-center h-full",
						isMobile ? "px-4" : ""
					)}>
						<EmptyState
							title="No Assigned Trips"
							description="You don't have any trips assigned to you yet. Check back later!"
						/>
					</div>
				) : (
					<div className={cn(
						isMobile ? "" : "grid gap-4"
					)}>
						{assignedTrips.map((trip) => (
							<TripCard key={trip.id} trip={trip} />
						))}
						{/* Bottom padding for mobile to ensure last item is visible above bottom nav */}
						{isMobile && (
							<div className="h-20"></div>
						)}
					</div>
				)}
			</div>

			{/* Booking Details Dialog */}
			<Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
				<DialogContent
					className={cn(
						"[&>button]:hidden", // Hide default close button
						isMobile ? "max-w-full w-full h-full m-0 rounded-none p-0 bg-gray-50 flex flex-col" : "max-w-md bg-gray-50"
					)}
				>
					{selectedBookingForDetails && (
						<div className={cn(
							isMobile ? "flex flex-col h-full" : "flex flex-col"
						)}>
							{/* Header */}
							<div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
								<div className="flex items-center justify-between">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setBookingDetailsOpen(false)}
										className="p-0 h-auto"
									>
										<ArrowLeft className="h-5 w-5" />
									</Button>
									<div className="text-center">
										<h2 className="text-lg font-bold">
											{format(new Date(selectedBookingForDetails.scheduledPickupTime), "MMM dd, yyyy h:mm a")}
										</h2>
										<span className="text-xs text-gray-400 font-mono">
											#{selectedBookingForDetails.id.slice(-6)}
										</span>
									</div>
									<div className="w-5" /> {/* Spacer for centering */}
								</div>
							</div>

							{/* Scrollable Content */}
							<div className={cn(
								"p-4 space-y-4",
								isMobile ? "flex-1 overflow-y-auto pb-24" : "flex-1"
							)}>
								{/* Customer Info */}
								<div className="bg-white rounded-lg p-4 border border-gray-200">
									<h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<User className="h-4 w-4 text-gray-400" />
											<span className="text-sm">{selectedBookingForDetails.customerName || 'Customer'}</span>
										</div>
										<div className="flex items-center gap-2">
											<Phone className="h-4 w-4 text-gray-400" />
											<span className="text-sm">{selectedBookingForDetails.customerPhone}</span>
										</div>
										<div className="flex items-center gap-2">
											<UsersIcon className="h-4 w-4 text-gray-400" />
											<span className="text-sm">{selectedBookingForDetails.passengerCount || 1} passenger{(selectedBookingForDetails.passengerCount || 1) !== 1 ? 's' : ''}</span>
										</div>
										{selectedBookingForDetails.stops && selectedBookingForDetails.stops.length > 0 && (
											<div className="flex items-center gap-2">
												<MapPinIcon className="h-4 w-4 text-gray-400" />
												<span className="text-sm">{selectedBookingForDetails.stops.length} stop{selectedBookingForDetails.stops.length > 1 ? 's' : ''}</span>
											</div>
										)}
									</div>
								</div>

								{/* Route Details */}
								<div className="bg-white rounded-lg p-4 border border-gray-200">
									<h3 className="font-semibold text-gray-900 mb-3">Journey Route</h3>
									<div className="space-y-3">
										{/* Origin */}
										<div className="flex items-start gap-3">
											<div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
											<div>
												<p className="text-xs font-medium text-green-700 mb-1">PICKUP</p>
												<p className="text-sm text-gray-900">{selectedBookingForDetails.originAddress}</p>
											</div>
										</div>

										{/* Stops */}
										{selectedBookingForDetails.stops && selectedBookingForDetails.stops.length > 0 && (
											<>
												{selectedBookingForDetails.stops.map((stop: any, index: number) => (
													<div key={stop.id || index} className="flex items-start gap-3">
														<div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
														<div>
															<p className="text-xs font-medium text-blue-700 mb-1">STOP {index + 1}</p>
															<p className="text-sm text-gray-900">{stop.address}</p>
														</div>
													</div>
												))}
											</>
										)}

										{/* Destination */}
										<div className="flex items-start gap-3">
											<div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
											<div>
												<p className="text-xs font-medium text-red-700 mb-1">DROP-OFF</p>
												<p className="text-sm text-gray-900">{selectedBookingForDetails.destinationAddress}</p>
											</div>
										</div>
									</div>
								</div>

								{/* Trip Details */}
								<div className="bg-white rounded-lg p-4 border border-gray-200">
									<h3 className="font-semibold text-gray-900 mb-3">Trip Details</h3>
									<div className="grid grid-cols-2 gap-4 text-sm">
										{selectedBookingForDetails.estimatedDistance && (
											<div>
												<span className="text-gray-600">Distance:</span>
												<p className="font-medium">{(selectedBookingForDetails.estimatedDistance / 1000).toFixed(1)} km</p>
											</div>
										)}
										{selectedBookingForDetails.estimatedDuration && (
											<div>
												<span className="text-gray-600">Duration:</span>
												<p className="font-medium">{Math.round(selectedBookingForDetails.estimatedDuration / 60)} min</p>
											</div>
										)}
										<div>
											<span className="text-gray-600">Fare:</span>
											<p className="font-medium text-primary">${(selectedBookingForDetails.quotedAmount || 0).toFixed(2)}</p>
										</div>
										<div>
											<span className="text-gray-600">Status:</span>
											<p className="font-medium capitalize">{selectedBookingForDetails.status?.replace('_', ' ')}</p>
										</div>
									</div>
								</div>

								{/* Special Requests */}
								{selectedBookingForDetails.specialRequests && (
									<div className="bg-white rounded-lg p-4 border border-gray-200">
										<h3 className="font-semibold text-gray-900 mb-2">Special Requests</h3>
										<p className="text-sm text-gray-700">{selectedBookingForDetails.specialRequests}</p>
									</div>
								)}
							</div>

							{/* Actions - Sticky at bottom for mobile */}
							<div className={cn(
								"p-4 bg-white border-t border-gray-200",
								isMobile ? "fixed bottom-0 left-0 right-0 z-50 shadow-2xl safe-area-pb" : "flex-shrink-0"
							)}>
								{selectedBookingForDetails.status === "driver_assigned" ? (
									<Button
										onClick={() => {
											handleStartTrip(selectedBookingForDetails.id);
										}}
										disabled={startingTripId === selectedBookingForDetails.id}
										className="w-full h-12 text-base font-semibold"
									>
										{startingTripId === selectedBookingForDetails.id ? (
											<>
												<Loader2Icon className="w-5 h-5 animate-spin mr-2" />
												Starting Trip...
											</>
										) : (
											'Start Trip'
										)}
									</Button>
								) : (
									<div className="text-center text-sm text-gray-500">
										Trip already started or completed
									</div>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
