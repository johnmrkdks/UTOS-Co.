import { createFileRoute, useParams } from "@tanstack/react-router";
import { useGetBookingByShareTokenQuery } from "@/features/booking-tracking/_hooks/use-get-booking-by-share-token-query";
import { useUpdateBookingStatusByTokenMutation } from "@/features/booking-tracking/_hooks/use-update-booking-status-by-token-mutation";
import { useCloseTripWithExtrasByShareTokenMutation, useCloseTripWithoutExtrasByShareTokenMutation } from "@/features/booking-tracking/_hooks/use-close-trip-by-share-token-mutations";
import { format } from "date-fns";
import {
	MapPin,
	Car,
	User,
	Loader2,
	AlertCircle,
	Phone,
	MessageSquare,
	Users,
	ArrowLeft,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import { BOOKING_STATUS_CONFIG, getNextStatus, isFinalStatus, type BookingStatus } from "@/lib/booking-status-config";
import { formatDistanceKm } from "@/utils/format";
import { cn } from "@workspace/ui/lib/utils";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CloseTripOptionsDialog } from "@/features/driver/_components/close-trip-options-dialog";
import { CloseTripExtrasForm, type ExtrasFormData } from "@/features/driver/_components/close-trip-extras-form";
import { TripConfirmationDialog } from "@/features/driver/_components/trip-confirmation-dialog";

function getGoogleMapsUrl(address: string, lat?: number | null, lng?: number | null): string {
	if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
		return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
	}
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "")}`;
}

export const Route = createFileRoute("/_marketing/driver-job/$token")({
	component: DriverJobPage,
});

function DriverJobPage() {
	const { token } = useParams({ from: "/_marketing/driver-job/$token" });
	const { data: booking, isLoading, error } = useGetBookingByShareTokenQuery(token);
	const updateStatus = useUpdateBookingStatusByTokenMutation(token);
	const closeWithExtras = useCloseTripWithExtrasByShareTokenMutation(token);
	const closeWithoutExtras = useCloseTripWithoutExtrasByShareTokenMutation(token);

	const [closeTripOptionsOpen, setCloseTripOptionsOpen] = useState(false);
	const [closeTripExtrasOpen, setCloseTripExtrasOpen] = useState(false);
	const [tripConfirmationOpen, setTripConfirmationOpen] = useState(false);
	const [isNoShow, setIsNoShow] = useState(false);
	const [extrasData, setExtrasData] = useState<ExtrasFormData | undefined>(undefined);

	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}, []);

	const handleStatusUpdate = (status: string) => {
		updateStatus.mutate({ shareToken: token, status: status as any });
	};

	// External drivers: when at dropped_off/awaiting_extras, open close-trip flow (cannot mark completed)
	const handleAddExtrasClick = () => {
		setCloseTripOptionsOpen(true);
	};

	const handleCloseTripOption = (option: "close" | "close-with-extras" | "no-show" | "no-show-with-extras" | "close-later") => {
		setCloseTripOptionsOpen(false);
		if (option === "close") {
			closeWithoutExtras.mutate({ shareToken: token, isNoShow: false });
		} else if (option === "close-with-extras") {
			setIsNoShow(false);
			setCloseTripExtrasOpen(true);
		} else if (option === "no-show") {
			closeWithoutExtras.mutate({ shareToken: token, isNoShow: true });
		} else if (option === "no-show-with-extras") {
			setIsNoShow(true);
			setCloseTripExtrasOpen(true);
		}
		// close-later: just close dialog, no action
	};

	const handleExtrasSubmit = (data: ExtrasFormData) => {
		setExtrasData(data);
		setCloseTripExtrasOpen(false);
		setTripConfirmationOpen(true);
	};

	const handleExtrasBack = () => {
		setCloseTripExtrasOpen(false);
		setCloseTripOptionsOpen(true);
	};

	const calculateTotalExtrasCharges = () => {
		if (!extrasData) return 0;
		return (extrasData.parkingCharges || 0) + (extrasData.tollCharges || 0) + (extrasData.otherCharges?.amount || 0);
	};

	const handleTripConfirmation = () => {
		if (!extrasData) return;
		const extrasForBackend = {
			additionalWaitTime: extrasData.additionalWaitTime || 0,
			unscheduledStops: extrasData.unscheduledStops || 0,
			parkingCharges: extrasData.parkingCharges || 0,
			tollCharges: extrasData.tollCharges || 0,
			location: extrasData.location || "",
			otherCharges: {
				description: extrasData.otherCharges?.description || "",
				amount: extrasData.otherCharges?.amount || 0,
			},
			extraType: (extrasData.extraType || "general") as "general" | "driver" | "operator",
			notes: extrasData.notes || "",
		};
		closeWithExtras.mutate(
			{ shareToken: token, isNoShow, extrasData: extrasForBackend },
			{
				onSuccess: () => {
					setTripConfirmationOpen(false);
					setExtrasData(undefined);
				},
			}
		);
	};

	const handleTripConfirmationBack = () => {
		setTripConfirmationOpen(false);
		setCloseTripExtrasOpen(true);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
				<Loader2 className="h-12 w-12 animate-spin text-gray-400" />
				<p className="mt-4 text-muted-foreground">Loading job details...</p>
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
				<AlertCircle className="h-12 w-12 text-destructive" />
				<h2 className="mt-4 text-xl font-semibold">Job not found</h2>
				<p className="mt-2 text-muted-foreground text-center">
					The share link may be invalid or expired.
				</p>
			</div>
		);
	}

	const statusConfig = BOOKING_STATUS_CONFIG[(booking.status as BookingStatus) ?? "pending"];
	const nextStatus = getNextStatus(booking.status);
	// External drivers can update status except to "completed" - they must add extras and submit
	const isAtCloseStage = ["dropped_off", "awaiting_extras"].includes(booking.status);
	const canUpdateStatus =
		!isFinalStatus(booking.status) &&
		!isAtCloseStage &&
		["driver_assigned", "confirmed", "driver_en_route", "arrived_pickup", "passenger_on_board", "in_progress"].includes(booking.status);
	const showAddExtrasButton = isAtCloseStage;

	const isPackageBooking = !!booking.packageId;
	const serviceType = booking.package?.packageServiceType?.rateType;
	const isHourlyService = serviceType === "hourly";
	const serviceName = booking.package?.name;
	const stopsCount = booking.stops?.length ?? 0;

	return (
		<div
			className={cn(
				"min-h-screen flex flex-col bg-gray-50",
				isMobile ? "" : "max-w-lg mx-auto"
			)}
		>
			{/* Header - matches driver app dialog header */}
			<div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
				<div className="flex items-center justify-between">
					<Link
						to="/"
						className="p-2 -m-2 rounded-lg hover:bg-gray-100 transition-colors"
						aria-label="Back"
					>
						<ArrowLeft className="h-5 w-5 text-gray-600" />
					</Link>
					<div className="text-center flex-1">
						<h1 className="text-lg font-bold text-gray-900">
							{format(new Date(booking.scheduledPickupTime), "MMM dd, yyyy h:mm a")}
						</h1>
						<div className="flex items-center justify-center gap-2 mt-1">
							<span className="text-xs text-gray-400 font-mono">
								{booking.referenceNumber || `#${booking.id.slice(-6)}`}
							</span>
							<Badge className={cn("text-xs", statusConfig?.bg, statusConfig?.text, statusConfig?.border)}>
								{statusConfig?.shortLabel ?? booking.status}
							</Badge>
						</div>
					</div>
					<div className="w-9" />
				</div>
			</div>

			{/* Scrollable content - matches driver app dialog content */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-4 space-y-4">
					{/* Customer info */}
					<div className="bg-white rounded-lg p-4 border border-gray-200">
						<h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4 text-gray-400" />
								<span className="text-sm">{booking.customerName || "Customer"}</span>
							</div>
							<div className="flex items-center gap-2">
								<Phone className="h-4 w-4 text-gray-400" />
								<span className="text-sm">{booking.customerPhone}</span>
							</div>
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 text-gray-400" />
								<span className="text-sm">
									{booking.passengerCount || 1} passenger{(booking.passengerCount || 1) !== 1 ? "s" : ""}
								</span>
							</div>
							{stopsCount > 0 && (
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-gray-400" />
									<span className="text-sm">{stopsCount} stop{stopsCount > 1 ? "s" : ""}</span>
								</div>
							)}
						</div>
					</div>

					{/* Route details - with Google Maps buttons */}
					<div className="bg-white rounded-lg p-4 border border-gray-200">
						<h3 className="font-semibold text-gray-900 mb-3">
							{booking.packageId ? "Service Details" : "Journey Route"}
						</h3>
						<div className="space-y-3">
							{isPackageBooking && (
								<div className="flex items-start gap-3">
									<div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
									<div>
										<p className="text-xs font-medium text-blue-700 mb-1">SERVICE</p>
										<p className="text-sm text-gray-900 font-medium">{serviceName || "Service Booking"}</p>
										{isHourlyService && booking.estimatedDuration != null && (
											<p className="text-xs text-green-600 font-medium mt-1">
												Booked: {Math.round(booking.estimatedDuration / 60)} hour
												{Math.round(booking.estimatedDuration / 60) !== 1 ? "s" : ""}
											</p>
										)}
									</div>
								</div>
							)}
							{(!isPackageBooking || isHourlyService || (booking.originAddress && !booking.originAddress.includes("TBD"))) && (
								<>
									{/* Pickup */}
									<div className="flex items-start gap-3">
										<div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<p className="text-xs font-medium text-green-700 mb-1">PICKUP</p>
											<button
												type="button"
												onClick={() =>
													window.open(
														getGoogleMapsUrl(
															booking.originAddress,
															booking.originLatitude,
															booking.originLongitude
														),
														"_blank",
														"noopener,noreferrer"
													)
												}
												className="text-sm text-gray-900 text-left hover:underline cursor-pointer bg-transparent border-0 p-0"
											>
												{booking.originAddress}
											</button>
										</div>
									</div>

									{/* Stops */}
									{booking.stops?.map((stop: { id?: string; address: string; latitude?: number | null; longitude?: number | null }, index: number) => (
										<div key={stop.id ?? index} className="flex items-start gap-3">
											<div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
											<div className="flex-1 min-w-0">
												<p className="text-xs font-medium text-blue-700 mb-1">STOP {index + 1}</p>
												<button
													type="button"
													onClick={() =>
														window.open(
															getGoogleMapsUrl(stop.address, stop.latitude, stop.longitude),
															"_blank",
															"noopener,noreferrer"
														)
													}
													className="text-sm text-gray-900 text-left hover:underline cursor-pointer bg-transparent border-0 p-0"
												>
													{stop.address}
												</button>
											</div>
										</div>
									))}

									{/* Destination */}
									<div className="flex items-start gap-3">
										<div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<p className="text-xs font-medium text-red-700 mb-1">DROP-OFF</p>
											<button
												type="button"
												onClick={() =>
													window.open(
														getGoogleMapsUrl(
															booking.destinationAddress,
															booking.destinationLatitude,
															booking.destinationLongitude
														),
														"_blank",
														"noopener,noreferrer"
													)
												}
												className="text-sm text-gray-900 text-left hover:underline cursor-pointer bg-transparent border-0 p-0"
											>
												{booking.destinationAddress}
											</button>
										</div>
									</div>
								</>
							)}
						</div>
					</div>

					{/* Trip details */}
					<div className="bg-white rounded-lg p-4 border border-gray-200">
						<h3 className="font-semibold text-gray-900 mb-3">Trip Details</h3>
						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-600">Vehicle:</span>
									<p className="font-medium mt-0.5">
										{booking.car?.name || booking.carName || "Vehicle not assigned"}
									</p>
								</div>
								{booking.estimatedDistance != null && (
									<div>
										<span className="text-gray-600">Distance:</span>
										<p className="font-medium">{formatDistanceKm(booking.estimatedDistance)}</p>
									</div>
								)}
								{booking.estimatedDuration != null && !booking.packageId && (
									<div>
										<span className="text-gray-600">Travel Duration:</span>
										<p className="font-medium">{Math.round(booking.estimatedDuration / 60)} min</p>
									</div>
								)}
								{booking.packageId &&
									booking.package?.packageServiceType?.rateType === "hourly" &&
									booking.estimatedDuration != null && (
										<div>
											<span className="text-gray-600">Client Booked:</span>
											<p className="font-medium text-green-600">
												{Math.round(booking.estimatedDuration / 60)} hour
												{Math.round(booking.estimatedDuration / 60) !== 1 ? "s" : ""}
											</p>
										</div>
									)}
								<div>
									<span className="text-gray-600">Luggage:</span>
									<p className="font-medium">{booking.luggageCount || 0} piece{(booking.luggageCount || 0) !== 1 ? "s" : ""}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Offload details */}
					{booking.bookingType === "offload" && booking.offloadDetails && (
						<div className="bg-white rounded-lg p-4 border border-gray-200">
							<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
								<Car className="h-4 w-4 text-orange-600" />
								Offload Booking Details
							</h3>
							<div className="bg-orange-50 rounded-lg p-3 space-y-2">
								<div>
									<span className="text-xs text-orange-600 font-medium">Company:</span>
									<p className="text-sm text-orange-800 font-medium">{booking.offloadDetails.offloaderName}</p>
								</div>
								<div>
									<span className="text-xs text-orange-600 font-medium">Job Type:</span>
									<p className="text-sm text-orange-800">{booking.offloadDetails.jobType}</p>
								</div>
								<div>
									<span className="text-xs text-orange-600 font-medium">Vehicle Type:</span>
									<p className="text-sm text-orange-800">{booking.offloadDetails.vehicleType}</p>
								</div>
							</div>
						</div>
					)}

					{/* Special requests */}
					{booking.specialRequests && (
						<div className="bg-white rounded-lg p-4 border border-gray-200">
							<h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
								<MessageSquare className="h-4 w-4 text-blue-600" />
								Special Requests
							</h3>
							<div className="bg-blue-50 rounded-lg p-3">
								<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
									{booking.specialRequests}
								</p>
							</div>
						</div>
					)}

					{/* Additional notes */}
					{booking.additionalNotes && (
						<div className="bg-white rounded-lg p-4 border border-gray-200">
							<h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
								<MessageSquare className="h-4 w-4 text-orange-600" />
								Additional Notes
							</h3>
							<div className="bg-orange-50 rounded-lg p-3">
								<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
									{booking.additionalNotes}
								</p>
							</div>
						</div>
					)}

					{/* Bottom padding for sticky footer */}
					<div className="h-4" />
				</div>
			</div>

			{/* Sticky customer contact bar - matches driver app */}
			<div className="flex-shrink-0 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3 min-w-0">
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
							<User className="h-5 w-5 text-white" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="font-semibold text-sm text-gray-900 truncate">{booking.customerName}</p>
							<p className="text-xs text-gray-600 truncate">{booking.customerPhone}</p>
						</div>
					</div>
					<div className="flex gap-2 flex-shrink-0">
						<Button
							variant="outline"
							size={isMobile ? "default" : "sm"}
							className="rounded-full shadow-sm hover:shadow-md transition-shadow border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100 h-10 w-10 p-0"
							onClick={() => (window.location.href = `tel:${booking.customerPhone}`)}
						>
							<Phone className="h-5 w-5 text-green-600" />
						</Button>
						<Button
							variant="outline"
							size={isMobile ? "default" : "sm"}
							className="rounded-full shadow-sm hover:shadow-md transition-shadow border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 h-10 w-10 p-0"
							onClick={() => (window.location.href = `sms:${booking.customerPhone}`)}
						>
							<MessageSquare className="h-5 w-5 text-blue-600" />
						</Button>
					</div>
				</div>
			</div>

			{/* Sticky action button */}
			<div className={cn("flex-shrink-0 p-4 bg-white border-t border-gray-200", isMobile ? "shadow-2xl" : "")}>
				{showAddExtrasButton ? (
					<div className="space-y-2">
						<p className="text-xs text-center text-gray-500">
							Add tolls, parking, waiting time. Admin will finalize the amount.
						</p>
						<Button
							className="w-full h-12 text-base font-semibold"
							onClick={handleAddExtrasClick}
							disabled={closeWithExtras.isPending || closeWithoutExtras.isPending}
						>
							{closeWithExtras.isPending || closeWithoutExtras.isPending ? (
								<>
									<Loader2 className="h-5 w-5 animate-spin mr-2" />
									Submitting...
								</>
							) : (
								"Add extras & submit"
							)}
						</Button>
					</div>
				) : canUpdateStatus && nextStatus !== booking.status ? (
					<Button
						className="w-full h-12 text-base font-semibold"
						onClick={() => handleStatusUpdate(nextStatus)}
						disabled={updateStatus.isPending}
					>
						{updateStatus.isPending ? (
							<>
								<Loader2 className="h-5 w-5 animate-spin mr-2" />
								Updating...
							</>
						) : (
							BOOKING_STATUS_CONFIG[nextStatus as BookingStatus]?.actionLabel ??
							`Mark as ${nextStatus.replace("_", " ")}`
						)}
					</Button>
				) : isFinalStatus(booking.status) ? (
					<div className="text-center text-sm text-gray-500 py-2">
						This job is {booking.status.replace("_", " ")}.
					</div>
				) : (
					<div className="text-center text-sm text-gray-500 py-2">
						No action available for this status.
					</div>
				)}
			</div>

			{/* Close trip dialogs - for external drivers to add extras */}
			<CloseTripOptionsDialog
				open={closeTripOptionsOpen}
				onOpenChange={setCloseTripOptionsOpen}
				booking={booking}
				onSelectOption={handleCloseTripOption}
			/>
			<CloseTripExtrasForm
				open={closeTripExtrasOpen}
				onOpenChange={setCloseTripExtrasOpen}
				booking={booking}
				isNoShow={isNoShow}
				onSubmit={handleExtrasSubmit}
				onBack={handleExtrasBack}
			/>
			<TripConfirmationDialog
				open={tripConfirmationOpen}
				onOpenChange={setTripConfirmationOpen}
				booking={booking}
				extrasData={extrasData}
				totalCharges={calculateTotalExtrasCharges()}
				onConfirm={handleTripConfirmation}
				onGoBack={handleTripConfirmationBack}
				isSubmitting={closeWithExtras.isPending}
			/>
		</div>
	);
}
