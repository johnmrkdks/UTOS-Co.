import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import {
	ArrowLeft,
	CarIcon,
	CheckCircleIcon,
	ClockIcon,
	DollarSignIcon,
	Loader2Icon,
	MapPinIcon,
	MessageSquare,
	Phone,
	User,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BookingTypeBadge } from "@/components/booking-type-badge";
import { useUpdateBookingStatusMutation } from "@/features/dashboard/_pages/booking-management/_hooks/query/use-update-booking-status-mutation";
import { useDriverBookingsQuery } from "@/hooks/query/use-driver-bookings-query";
import { formatDistanceKm } from "@/utils/format";

export const Route = createFileRoute("/driver/_layout/available")({
	component: AvailableTripsPage,
});

function AvailableTripsPage() {
	// Memoize mobile detection to prevent re-evaluation during render
	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		);
	}, []);

	// State for trip details dialog
	const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
	const [selectedBookingForDetails, setSelectedBookingForDetails] =
		useState<any>(null);

	// State to track which trip is being started
	const [startingTripId, setStartingTripId] = useState<string | null>(null);

	// Get assigned trips for current driver
	const {
		data: assignedTripsData,
		isLoading: assignedLoading,
		error: assignedError,
	} = useDriverBookingsQuery({
		limit: 50,
		filters: {
			status: "driver_assigned",
		},
	});

	const assignedTrips = (assignedTripsData?.data || []).sort((a, b) => {
		// Sort by closest scheduled pickup time (soonest first)
		return (
			new Date(a.scheduledPickupTime).getTime() -
			new Date(b.scheduledPickupTime).getTime()
		);
	});

	// Status update mutation
	const updateStatusMutation = useUpdateBookingStatusMutation();

	const handleStartTrip = async (tripId: string) => {
		try {
			setStartingTripId(tripId); // Track which trip is being started
			// Update trip status from 'driver_assigned' to 'driver_en_route'
			updateStatusMutation.mutate(
				{
					id: tripId,
					status: "driver_en_route" as any,
				},
				{
					onSuccess: () => {
						setStartingTripId(null); // Clear loading state on success
						setBookingDetailsOpen(false); // Close dialog on success
					},
					onError: () => {
						setStartingTripId(null); // Clear loading state on error
						toast.error("Failed to start trip");
					},
				},
			);
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
		const formatDistance = (km: number) => Number(km).toFixed(1); // DB stores km (display only)
		const formatDuration = (seconds: number) => Math.round(seconds / 60);

		// Better car name handling
		const getCarDisplayName = () => {
			if (trip.car?.name) return trip.car.name;

			const make = trip.car?.make;
			const model = trip.car?.model;

			if (make && model) return `${make} ${model}`;
			if (make) return make;
			if (model) return model;

			return `Booking #${trip.id.slice(-6).toUpperCase()}`;
		};

		const totalAmount =
			trip.quotedAmount || (trip.baseFare || 0) + (trip.distanceFare || 0) || 0;
		const stopsCount = trip.stops ? trip.stops.length : 0;

		// Package service type identification
		const isPackageBooking = !!trip.packageId;
		const serviceType = trip.package?.packageServiceType?.rateType; // 'fixed' or 'hourly'
		const isHourlyService = serviceType === "hourly";
		const serviceDuration = trip.package?.duration; // in minutes (package default)
		const serviceName = trip.package?.name;

		// For hourly services, get client-booked hours from estimatedDuration
		const clientBookedHours =
			isHourlyService && trip.estimatedDuration
				? Math.round(trip.estimatedDuration / 60) // Convert minutes to hours
				: null;

		return (
			<Card
				className={cn(
					"cursor-pointer bg-white transition-colors active:bg-gray-50",
					isMobile
						? "rounded-none border-0 border-gray-200 border-b shadow-none"
						: "border border-gray-200 shadow-sm hover:shadow-md",
				)}
				onClick={() => handleTripClick(trip)}
			>
				<CardContent className={cn(isMobile ? "px-4 py-4" : "p-3")}>
					{isMobile ? (
						// Mobile optimized layout
						<>
							{/* Header - Time and ID */}
							<div className="mb-2 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<ClockIcon className="h-4 w-4 text-blue-500" />
									<div>
										<div className="flex items-center gap-2">
											<span className="font-bold text-gray-900 text-lg">
												{format(new Date(trip.scheduledPickupTime), "h:mm a")}
											</span>
											<span className="font-mono text-gray-400 text-xs">
												#{trip.id.slice(-6)}
											</span>
										</div>
										<div className="text-gray-500 text-xs">
											{format(
												new Date(trip.scheduledPickupTime),
												"MMM dd, yyyy",
											)}
										</div>
									</div>
								</div>
								<Badge className="border-emerald-200 bg-emerald-50 px-2 py-1 font-bold text-emerald-700 text-sm">
									${formatCurrency(totalAmount)}
								</Badge>
							</div>

							{/* Type Badge and Distance */}
							<div className="mb-3 flex items-center justify-between">
								<div className="flex flex-wrap items-center gap-2">
									<BookingTypeBadge booking={trip} />
									{trip.bookingType === "offload" && trip.offloadDetails && (
										<Badge
											variant="outline"
											className="border-orange-200 bg-orange-50 text-orange-700 text-xs"
										>
											{trip.offloadDetails.offloaderName}
										</Badge>
									)}
								</div>
								{trip.estimatedDistance && (
									<div className="flex items-center gap-2 text-gray-500 text-xs">
										<span>{formatDistance(trip.estimatedDistance)}km</span>
										<span>•</span>
										<span>
											{formatDuration(trip.estimatedDuration || 0)}min
										</span>
									</div>
								)}
							</div>

							{/* Route - Ultra Compact Mobile Layout */}
							<div className="mb-3 space-y-1.5">
								{isPackageBooking && !isHourlyService ? (
									/* Fixed Package Service Display - No Routes */
									<div className="flex items-center gap-2">
										<div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
										<p className="line-clamp-1 text-gray-700 text-xs leading-tight">
											<span className="font-medium">
												{serviceName || "Service Booking"}
											</span>
										</p>
									</div>
								) : isPackageBooking && isHourlyService ? (
									/* Hourly Package Service - Show Routes */
									<>
										{/* Service Name Header */}
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
											<p className="line-clamp-1 text-gray-700 text-xs leading-tight">
												<span className="font-medium">
													{serviceName || "Hourly Service"}
												</span>
												{clientBookedHours && (
													<span className="font-medium text-green-600">
														{" "}
														• {clientBookedHours}h booked
													</span>
												)}
											</p>
										</div>

										{/* Origin */}
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
											<p className="line-clamp-1 text-gray-700 text-xs leading-tight">
												{trip.originAddress.length > 35
													? trip.originAddress.substring(0, 35) + "..."
													: trip.originAddress}
											</p>
										</div>

										{/* Stops (if any) */}
										{stopsCount > 0 && (
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
												<p className="line-clamp-1 text-blue-600 text-xs leading-tight">
													{stopsCount} stop{stopsCount > 1 ? "s" : ""}
												</p>
											</div>
										)}

										{/* Destination */}
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
											<p className="line-clamp-1 text-gray-700 text-xs leading-tight">
												{trip.destinationAddress.length > 35
													? trip.destinationAddress.substring(0, 35) + "..."
													: trip.destinationAddress}
											</p>
										</div>
									</>
								) : (
									/* Custom Booking Routes */
									<>
										{/* Origin */}
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
											<p className="line-clamp-1 text-gray-700 text-xs leading-tight">
												{trip.originAddress.length > 35
													? trip.originAddress.substring(0, 35) + "..."
													: trip.originAddress}
											</p>
										</div>

										{/* Stops (if any) */}
										{stopsCount > 0 && (
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
												<p className="line-clamp-1 text-blue-600 text-xs leading-tight">
													{stopsCount} stop{stopsCount > 1 ? "s" : ""}
												</p>
											</div>
										)}

										{/* Destination */}
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
											<p className="line-clamp-1 text-gray-700 text-xs leading-tight">
												{trip.destinationAddress.length > 35
													? trip.destinationAddress.substring(0, 35) + "..."
													: trip.destinationAddress}
											</p>
										</div>
									</>
								)}
							</div>

							{/* Offloader Details Section - Mobile */}
							{trip.bookingType === "offload" && trip.offloadDetails && (
								<div className="mb-3">
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

							{/* Notes Section - Mobile */}
							{(trip.specialRequests || trip.additionalNotes) && (
								<div className="mb-3 space-y-2">
									{trip.specialRequests && (
										<div className="rounded-md border border-blue-100 bg-blue-50 p-2">
											<div className="mb-1 flex items-center gap-1">
												<MessageSquare className="h-3 w-3 text-blue-600" />
												<span className="font-semibold text-blue-800 text-xs">
													Special Requests
												</span>
											</div>
											<p className="line-clamp-2 text-blue-700 text-xs leading-tight">
												{trip.specialRequests}
											</p>
										</div>
									)}
									{trip.additionalNotes && (
										<div className="rounded-md border border-orange-100 bg-orange-50 p-2">
											<div className="mb-1 flex items-center gap-1">
												<MessageSquare className="h-3 w-3 text-orange-600" />
												<span className="font-semibold text-orange-800 text-xs">
													Additional Notes
												</span>
											</div>
											<p className="line-clamp-2 text-orange-700 text-xs leading-tight">
												{trip.additionalNotes}
											</p>
										</div>
									)}
								</div>
							)}

							{/* Customer, Pax, and Car - Compact Bottom Row */}
							<div className="flex items-center gap-2 border-gray-100 border-t pt-2">
								<div className="flex items-center gap-1 text-gray-600 text-xs">
									<UserIcon className="h-3 w-3 text-gray-400" />
									<span className="max-w-[80px] truncate font-medium">
										{trip.customerName || "Customer"}
									</span>
								</div>
								<div className="flex items-center gap-1 text-gray-600 text-xs">
									<UsersIcon className="h-3 w-3 text-gray-400" />
									<span className="font-medium">
										{trip.passengerCount || 1}
									</span>
								</div>
								<div className="flex min-w-0 flex-1 items-center gap-1 text-gray-600 text-xs">
									<CarIcon className="h-3 w-3 text-gray-400" />
									<span className="truncate font-medium">
										{trip.car?.name ||
											trip.carName ||
											trip.vehicleName ||
											trip.vehicle?.name ||
											"Unassigned"}
									</span>
								</div>
							</div>
						</>
					) : (
						// Desktop layout - Improved compact design
						<>
							{/* Compact Header Row */}
							<div className="mb-2 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<ClockIcon className="h-4 w-4 text-blue-500" />
									<div>
										<div className="flex items-center gap-2">
											<span className="font-bold text-gray-900 text-lg">
												{format(new Date(trip.scheduledPickupTime), "h:mm a")}
											</span>
											<span className="font-mono text-gray-400 text-xs">
												#{trip.id.slice(-6)}
											</span>
										</div>
										<div className="text-gray-500 text-xs">
											{format(
												new Date(trip.scheduledPickupTime),
												"MMM dd, yyyy",
											)}
										</div>
									</div>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<BookingTypeBadge booking={trip} />
									{trip.bookingType === "offload" && trip.offloadDetails && (
										<Badge
											variant="outline"
											className="border-orange-200 bg-orange-50 text-orange-700 text-xs"
										>
											{trip.offloadDetails.offloaderName}
										</Badge>
									)}
									<Badge className="border-emerald-200 bg-emerald-50 px-3 py-1 font-bold text-emerald-700">
										${formatCurrency(totalAmount)}
									</Badge>
								</div>
							</div>

							{/* Service/Route Information - More Compact */}
							<div className="mb-3 space-y-2">
								{isPackageBooking && !isHourlyService ? (
									/* Fixed Package Service Display - Compact */
									<div className="flex items-center gap-2">
										<div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
										<span className="font-medium text-gray-900 text-sm">
											{serviceName || "Service Booking"}
										</span>
									</div>
								) : isPackageBooking && isHourlyService ? (
									/* Hourly Package Service - Compact with Routes */
									<>
										{/* Service Header - Inline */}
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
											<span className="font-medium text-gray-900 text-sm">
												{serviceName || "Hourly Service"}
											</span>
											{clientBookedHours && (
												<span className="font-medium text-green-600 text-xs">
													({clientBookedHours}h booked)
												</span>
											)}
										</div>

										{/* Origin - Compact */}
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
											<span className="text-gray-600 text-xs">From:</span>
											<span className="truncate text-gray-900 text-sm">
												{trip.originAddress}
											</span>
										</div>

										{/* Stops (if any) - Compact */}
										{stopsCount > 0 && (
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
												<span className="text-blue-600 text-xs">
													{stopsCount} stop{stopsCount > 1 ? "s" : ""}
												</span>
											</div>
										)}

										{/* Destination - Compact */}
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
											<span className="text-gray-600 text-xs">To:</span>
											<span className="truncate text-gray-900 text-sm">
												{trip.destinationAddress}
											</span>
										</div>
									</>
								) : (
									/* Custom Booking Routes - Compact */
									<>
										{/* Origin - Compact */}
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
											<span className="text-gray-600 text-xs">From:</span>
											<span className="truncate text-gray-900 text-sm">
												{trip.originAddress}
											</span>
										</div>

										{/* Stops (if any) - Compact */}
										{stopsCount > 0 && (
											<div className="flex items-center gap-2">
												<div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
												<span className="text-blue-600 text-xs">
													{stopsCount} stop{stopsCount > 1 ? "s" : ""}
												</span>
											</div>
										)}

										{/* Destination - Compact */}
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
											<span className="text-gray-600 text-xs">To:</span>
											<span className="truncate text-gray-900 text-sm">
												{trip.destinationAddress}
											</span>
										</div>
									</>
								)}
							</div>

							{/* Offloader Details Section - Desktop */}
							{trip.bookingType === "offload" && trip.offloadDetails && (
								<div className="mb-3">
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

							{/* Notes Section - Desktop */}
							{(trip.specialRequests || trip.additionalNotes) && (
								<div className="mb-3 space-y-2">
									{trip.specialRequests && (
										<div className="rounded-md border border-blue-100 bg-blue-50 p-2">
											<div className="mb-1 flex items-center gap-1">
												<MessageSquare className="h-3 w-3 text-blue-600" />
												<span className="font-semibold text-blue-800 text-xs">
													Special Requests
												</span>
											</div>
											<p className="line-clamp-2 text-blue-700 text-xs leading-tight">
												{trip.specialRequests}
											</p>
										</div>
									)}
									{trip.additionalNotes && (
										<div className="rounded-md border border-orange-100 bg-orange-50 p-2">
											<div className="mb-1 flex items-center gap-1">
												<MessageSquare className="h-3 w-3 text-orange-600" />
												<span className="font-semibold text-orange-800 text-xs">
													Additional Notes
												</span>
											</div>
											<p className="line-clamp-2 text-orange-700 text-xs leading-tight">
												{trip.additionalNotes}
											</p>
										</div>
									)}
								</div>
							)}

							{/* Footer - Compact Row */}
							<div className="flex items-center justify-between border-gray-100 border-t pt-2">
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-1">
										<UserIcon className="h-3 w-3 text-gray-400" />
										<span className="font-medium text-gray-600 text-xs">
											{trip.customerName || "Customer"}
										</span>
									</div>
									<div className="flex items-center gap-1">
										<UsersIcon className="h-3 w-3 text-gray-400" />
										<span className="text-gray-600 text-xs">
											{trip.passengerCount || 1}
										</span>
									</div>
								</div>
								<div className="flex items-center gap-3">
									{trip.estimatedDistance && (
										<span className="text-gray-500 text-xs">
											{formatDistance(trip.estimatedDistance)}km
										</span>
									)}
									<div className="flex items-center gap-1">
										<CarIcon className="h-3 w-3 text-gray-400" />
										<span className="max-w-[100px] truncate text-gray-600 text-xs">
											{trip.car?.name ||
												trip.carName ||
												trip.vehicleName ||
												trip.vehicle?.name ||
												"Unassigned"}
										</span>
									</div>
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
			<Loader2Icon className="h-8 w-8 animate-spin text-gray-400" />
		</div>
	);

	const EmptyState = ({
		title,
		description,
	}: {
		title: string;
		description: string;
	}) => (
		<div className="flex flex-col items-center justify-center py-12">
			<MapPinIcon className="mb-4 h-16 w-16 text-gray-300" />
			<h3 className="mb-2 font-medium text-gray-900 text-lg">{title}</h3>
			<p className="text-center text-gray-500">{description}</p>
		</div>
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
							Available Trips
						</h1>
						<p className="text-gray-600 text-xs">
							Your assigned trips ready to start
						</p>
					</div>
				</div>
			</div>

			{/* Trips List */}
			<div className={cn(isMobile ? "flex-1 overflow-y-auto" : "space-y-4")}>
				{assignedLoading ? (
					<div
						className={cn(
							"flex h-full items-center justify-center",
							isMobile ? "px-4" : "",
						)}
					>
						<LoadingState />
					</div>
				) : assignedError ? (
					<div
						className={cn(
							"flex h-full items-center justify-center",
							isMobile ? "px-4" : "",
						)}
					>
						<EmptyState
							title="Error Loading Trips"
							description="There was an error loading your assigned trips. Please try again."
						/>
					</div>
				) : assignedTrips.length === 0 ? (
					<div
						className={cn(
							"flex h-full items-center justify-center",
							isMobile ? "px-4" : "",
						)}
					>
						<EmptyState
							title="No Assigned Trips"
							description="You don't have any trips assigned to you yet. Check back later!"
						/>
					</div>
				) : (
					<div className={cn(isMobile ? "" : "space-y-3")}>
						{assignedTrips.map((trip) => (
							<TripCard key={trip.id} trip={trip} />
						))}
						{/* Bottom padding for mobile to ensure last item is visible above bottom nav */}
						{isMobile && <div className="h-20" />}
					</div>
				)}
			</div>

			{/* Booking Details Dialog */}
			<Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
				<DialogContent
					showCloseButton={!isMobile}
					className={cn(
						isMobile
							? "m-0 h-full w-full max-w-full rounded-none bg-gray-50 p-0"
							: "max-h-[90vh] max-w-md bg-gray-50",
					)}
				>
					{selectedBookingForDetails && (
						<div
							className={cn(
								"flex flex-col",
								isMobile ? "h-full min-h-full" : "h-full max-h-[90vh]",
							)}
						>
							{/* Header */}
							<div className="flex-shrink-0 border-gray-200 border-b bg-white p-4">
								<div className="flex items-center justify-between">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setBookingDetailsOpen(false)}
										className="h-auto p-0"
									>
										<ArrowLeft className="h-5 w-5" />
									</Button>
									<div className="text-center">
										<h2 className="font-bold text-lg">
											{format(
												new Date(selectedBookingForDetails.scheduledPickupTime),
												"MMM dd, yyyy h:mm a",
											)}
										</h2>
										<span className="font-mono text-gray-400 text-xs">
											#{selectedBookingForDetails.id.slice(-6)}
										</span>
									</div>
									<div className="w-5" /> {/* Spacer for centering */}
								</div>
							</div>

							{/* Scrollable Content Area */}
							<div className={cn("flex-1 overflow-y-auto", isMobile ? "" : "")}>
								<div className="space-y-4 p-4">
									{/* Customer Info - Moved to scrollable area */}
									<div className="rounded-lg border border-gray-200 bg-white p-4">
										<h3 className="mb-2 font-semibold text-gray-900">
											Customer Information
										</h3>
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<User className="h-4 w-4 text-gray-400" />
												<span className="text-sm">
													{selectedBookingForDetails.customerName || "Customer"}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<Phone className="h-4 w-4 text-gray-400" />
												<span className="text-sm">
													{selectedBookingForDetails.customerPhone}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<UsersIcon className="h-4 w-4 text-gray-400" />
												<span className="text-sm">
													{selectedBookingForDetails.passengerCount || 1}{" "}
													passenger
													{(selectedBookingForDetails.passengerCount || 1) !== 1
														? "s"
														: ""}
												</span>
											</div>
											{selectedBookingForDetails.stops &&
												selectedBookingForDetails.stops.length > 0 && (
													<div className="flex items-center gap-2">
														<MapPinIcon className="h-4 w-4 text-gray-400" />
														<span className="text-sm">
															{selectedBookingForDetails.stops.length} stop
															{selectedBookingForDetails.stops.length > 1
																? "s"
																: ""}
														</span>
													</div>
												)}
										</div>
									</div>

									{/* Route Details */}
									<div className="rounded-lg border border-gray-200 bg-white p-4">
										<h3 className="mb-3 font-semibold text-gray-900">
											{selectedBookingForDetails.packageId
												? "Service Details"
												: "Journey Route"}
										</h3>
										<div className="space-y-3">
											{selectedBookingForDetails.packageId ? (
												/* Package Service Details */
												<>
													<div className="flex items-start gap-3">
														<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
														<div>
															<p className="mb-1 font-medium text-blue-700 text-xs">
																SERVICE
															</p>
															<p className="font-medium text-gray-900 text-sm">
																{selectedBookingForDetails.package?.name ||
																	"Service Booking"}
															</p>
															{/* Show client-booked hours for hourly services */}
															{selectedBookingForDetails.package
																?.packageServiceType?.rateType === "hourly" &&
																selectedBookingForDetails.estimatedDuration && (
																	<p className="mt-1 font-medium text-green-600 text-xs">
																		Booked:{" "}
																		{Math.round(
																			selectedBookingForDetails.estimatedDuration /
																				60,
																		)}{" "}
																		hour
																		{Math.round(
																			selectedBookingForDetails.estimatedDuration /
																				60,
																		) !== 1
																			? "s"
																			: ""}
																	</p>
																)}
														</div>
													</div>

													{/* For hourly services, always show routes. For fixed services, only show if not TBD */}
													{(selectedBookingForDetails.package
														?.packageServiceType?.rateType === "hourly" ||
														(selectedBookingForDetails.originAddress &&
															!selectedBookingForDetails.originAddress.includes(
																"TBD",
															))) && (
														<div className="flex items-start gap-3">
															<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-green-500" />
															<div>
																<p className="mb-1 font-medium text-green-700 text-xs">
																	PICKUP
																</p>
																<p className="text-gray-900 text-sm">
																	{selectedBookingForDetails.originAddress}
																</p>
															</div>
														</div>
													)}

													{/* Show stops for hourly services */}
													{selectedBookingForDetails.package?.packageServiceType
														?.rateType === "hourly" &&
														selectedBookingForDetails.stops &&
														selectedBookingForDetails.stops.length > 0 && (
															<>
																{selectedBookingForDetails.stops.map(
																	(stop: any, index: number) => (
																		<div
																			key={stop.id || index}
																			className="flex items-start gap-3"
																		>
																			<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
																			<div>
																				<p className="mb-1 font-medium text-blue-700 text-xs">
																					STOP {index + 1}
																				</p>
																				<p className="text-gray-900 text-sm">
																					{stop.address}
																				</p>
																			</div>
																		</div>
																	),
																)}
															</>
														)}

													{/* For hourly services, always show destination. For fixed services, only show if not TBD */}
													{(selectedBookingForDetails.package
														?.packageServiceType?.rateType === "hourly" ||
														(selectedBookingForDetails.destinationAddress &&
															!selectedBookingForDetails.destinationAddress.includes(
																"TBD",
															))) && (
														<div className="flex items-start gap-3">
															<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />
															<div>
																<p className="mb-1 font-medium text-red-700 text-xs">
																	DROP-OFF
																</p>
																<p className="text-gray-900 text-sm">
																	{selectedBookingForDetails.destinationAddress}
																</p>
															</div>
														</div>
													)}
												</>
											) : (
												/* Custom Booking Routes */
												<>
													{/* Origin */}
													<div className="flex items-start gap-3">
														<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-green-500" />
														<div>
															<p className="mb-1 font-medium text-green-700 text-xs">
																PICKUP
															</p>
															<p className="text-gray-900 text-sm">
																{selectedBookingForDetails.originAddress}
															</p>
														</div>
													</div>

													{/* Stops */}
													{selectedBookingForDetails.stops &&
														selectedBookingForDetails.stops.length > 0 && (
															<>
																{selectedBookingForDetails.stops.map(
																	(stop: any, index: number) => (
																		<div
																			key={stop.id || index}
																			className="flex items-start gap-3"
																		>
																			<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
																			<div>
																				<p className="mb-1 font-medium text-blue-700 text-xs">
																					STOP {index + 1}
																				</p>
																				<p className="text-gray-900 text-sm">
																					{stop.address}
																				</p>
																			</div>
																		</div>
																	),
																)}
															</>
														)}

													{/* Destination */}
													<div className="flex items-start gap-3">
														<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />
														<div>
															<p className="mb-1 font-medium text-red-700 text-xs">
																DROP-OFF
															</p>
															<p className="text-gray-900 text-sm">
																{selectedBookingForDetails.destinationAddress}
															</p>
														</div>
													</div>
												</>
											)}
										</div>
									</div>

									{/* Trip Details */}
									<div className="rounded-lg border border-gray-200 bg-white p-4">
										<h3 className="mb-3 font-semibold text-gray-900">
											Trip Details
										</h3>
										<div className="space-y-3">
											{/* Booking Type and ID */}
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div>
													<span className="text-gray-600">Booking Type:</span>
													<p className="font-medium capitalize">
														{selectedBookingForDetails.bookingType?.replace(
															"_",
															" ",
														) || "Unknown"}
													</p>
												</div>
												<div>
													<span className="text-gray-600">Booking ID:</span>
													<p className="font-medium font-mono text-sm">
														#{selectedBookingForDetails.id?.slice(-6) || "N/A"}
													</p>
												</div>
											</div>

											{/* Package/Service Name if applicable */}
											{selectedBookingForDetails.packageId &&
												selectedBookingForDetails.package?.name && (
													<div>
														<span className="text-gray-600">Service:</span>
														<p className="font-medium text-blue-600">
															{selectedBookingForDetails.package.name}
														</p>
													</div>
												)}

											{/* Vehicle Details */}
											<div>
												<span className="text-gray-600">Vehicle:</span>
												<p className="font-medium">
													{selectedBookingForDetails.car?.name ||
														selectedBookingForDetails.carName ||
														selectedBookingForDetails.vehicleName ||
														selectedBookingForDetails.vehicle?.name ||
														"Vehicle not assigned"}
												</p>
											</div>

											{/* Trip metrics in a grid */}
											<div className="grid grid-cols-2 gap-4 text-sm">
												{/* Show client-booked duration for hourly packages */}
												{selectedBookingForDetails.packageId &&
													selectedBookingForDetails.package?.packageServiceType
														?.rateType === "hourly" &&
													selectedBookingForDetails.estimatedDuration && (
														<div>
															<span className="text-gray-600">
																Client Booked:
															</span>
															<p className="font-medium text-green-600">
																{Math.round(
																	selectedBookingForDetails.estimatedDuration /
																		60,
																)}{" "}
																hour
																{Math.round(
																	selectedBookingForDetails.estimatedDuration /
																		60,
																) !== 1
																	? "s"
																	: ""}
															</p>
														</div>
													)}
												{selectedBookingForDetails.estimatedDistance && (
													<div>
														<span className="text-gray-600">Distance:</span>
														<p className="font-medium">
															{formatDistanceKm(
																selectedBookingForDetails.estimatedDistance,
															)}
														</p>
													</div>
												)}
												{selectedBookingForDetails.estimatedDuration &&
													!selectedBookingForDetails.packageId && (
														<div>
															<span className="text-gray-600">
																Travel Duration:
															</span>
															<p className="font-medium">
																{Math.round(
																	selectedBookingForDetails.estimatedDuration /
																		60,
																)}{" "}
																min
															</p>
														</div>
													)}
												<div>
													<span className="text-gray-600">Fare:</span>
													<p className="font-medium text-primary">
														$
														{(
															selectedBookingForDetails.quotedAmount || 0
														).toFixed(2)}
													</p>
												</div>
												<div>
													<span className="text-gray-600">Luggage:</span>
													<p className="font-medium">
														{selectedBookingForDetails.luggageCount || 0} piece
														{(selectedBookingForDetails.luggageCount || 0) !== 1
															? "s"
															: ""}
													</p>
												</div>
												<div>
													<span className="text-gray-600">Status:</span>
													<p className="font-medium capitalize">
														{selectedBookingForDetails.status?.replace(
															"_",
															" ",
														)}
													</p>
												</div>
											</div>

											{/* Booking Time Info */}
											<div className="border-gray-100 border-t pt-2">
												<div className="grid grid-cols-2 gap-4 text-sm">
													<div>
														<span className="text-gray-600">Created:</span>
														<p className="font-medium text-xs">
															{selectedBookingForDetails.createdAt
																? format(
																		new Date(
																			selectedBookingForDetails.createdAt,
																		),
																		"MMM dd, h:mm a",
																	)
																: "N/A"}
														</p>
													</div>
													{selectedBookingForDetails.confirmedAt && (
														<div>
															<span className="text-gray-600">Confirmed:</span>
															<p className="font-medium text-xs">
																{format(
																	new Date(
																		selectedBookingForDetails.confirmedAt,
																	),
																	"MMM dd, h:mm a",
																)}
															</p>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>

									{/* Offloader Details */}
									{selectedBookingForDetails.bookingType === "offload" &&
										selectedBookingForDetails.offloadDetails && (
											<div className="rounded-lg border border-gray-200 bg-white p-4">
												<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
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
										<div className="rounded-lg border border-gray-200 bg-white p-4">
											<h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
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
										<div className="rounded-lg border border-gray-200 bg-white p-4">
											<h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
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
								</div>
							</div>

							{/* Sticky Customer Contact Info - Above Action Buttons */}
							<div className="flex-shrink-0 border-gray-200 border-t bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
											<User className="h-5 w-5 text-white" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold text-gray-900 text-sm">
												{selectedBookingForDetails.customerName}
											</p>
											<p className="text-gray-600 text-xs">
												{selectedBookingForDetails.customerPhone}
											</p>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size={isMobile ? "default" : "sm"}
											className={cn(
												"rounded-full border-green-200 bg-green-50 shadow-sm transition-shadow hover:border-green-300 hover:bg-green-100 hover:shadow-md",
												isMobile ? "h-11 w-11 p-0" : "h-9 w-9 p-0",
											)}
											onClick={() =>
												(window.location.href = `tel:${selectedBookingForDetails.customerPhone}`)
											}
										>
											<Phone
												className={cn(
													"text-green-600",
													isMobile ? "h-5 w-5" : "h-4 w-4",
												)}
											/>
										</Button>
										<Button
											variant="outline"
											size={isMobile ? "default" : "sm"}
											className={cn(
												"rounded-full border-blue-200 bg-blue-50 shadow-sm transition-shadow hover:border-blue-300 hover:bg-blue-100 hover:shadow-md",
												isMobile ? "h-11 w-11 p-0" : "h-9 w-9 p-0",
											)}
											onClick={() =>
												(window.location.href = `sms:${selectedBookingForDetails.customerPhone}`)
											}
										>
											<MessageSquare
												className={cn(
													"text-blue-600",
													isMobile ? "h-5 w-5" : "h-4 w-4",
												)}
											/>
										</Button>
									</div>
								</div>
							</div>

							{/* Actions - Flex positioned at bottom */}
							<div
								className={cn(
									"flex-shrink-0 border-gray-200 border-t bg-white p-4",
									isMobile ? "shadow-2xl" : "",
								)}
							>
								{selectedBookingForDetails.status === "driver_assigned" ? (
									<Button
										onClick={() => {
											handleStartTrip(selectedBookingForDetails.id);
										}}
										disabled={startingTripId === selectedBookingForDetails.id}
										className="h-12 w-full font-semibold text-base"
									>
										{startingTripId === selectedBookingForDetails.id ? (
											<>
												<Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
												Starting Trip...
											</>
										) : (
											"Start Trip"
										)}
									</Button>
								) : (
									<div className="text-center text-gray-500 text-sm">
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
