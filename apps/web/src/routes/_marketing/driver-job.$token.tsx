import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import {
	AlertCircle,
	ArrowLeft,
	Car,
	Loader2,
	MapPin,
	MessageSquare,
	Phone,
	User,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	useCloseTripWithExtrasByShareTokenMutation,
	useCloseTripWithoutExtrasByShareTokenMutation,
} from "@/features/booking-tracking/_hooks/use-close-trip-by-share-token-mutations";
import { useGetBookingByShareTokenQuery } from "@/features/booking-tracking/_hooks/use-get-booking-by-share-token-query";
import { useUpdateBookingStatusByTokenMutation } from "@/features/booking-tracking/_hooks/use-update-booking-status-by-token-mutation";
import {
	CloseTripExtrasForm,
	type ExtrasFormData,
} from "@/features/driver/_components/close-trip-extras-form";
import { CloseTripOptionsDialog } from "@/features/driver/_components/close-trip-options-dialog";
import { TripConfirmationDialog } from "@/features/driver/_components/trip-confirmation-dialog";
import {
	BOOKING_STATUS_CONFIG,
	type BookingStatus,
	getNextStatus,
	isFinalStatus,
} from "@/lib/booking-status-config";
import { formatDistanceKm } from "@/utils/format";

function getGoogleMapsUrl(
	address: string,
	lat?: number | null,
	lng?: number | null,
): string {
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
	const {
		data: booking,
		isLoading,
		error,
	} = useGetBookingByShareTokenQuery(token);
	const updateStatus = useUpdateBookingStatusByTokenMutation(token);
	const closeWithExtras = useCloseTripWithExtrasByShareTokenMutation(token);
	const closeWithoutExtras =
		useCloseTripWithoutExtrasByShareTokenMutation(token);

	const [closeTripOptionsOpen, setCloseTripOptionsOpen] = useState(false);
	const [closeTripExtrasOpen, setCloseTripExtrasOpen] = useState(false);
	const [tripConfirmationOpen, setTripConfirmationOpen] = useState(false);
	const [isNoShow, setIsNoShow] = useState(false);
	const [extrasData, setExtrasData] = useState<ExtrasFormData | undefined>(
		undefined,
	);

	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		);
	}, []);

	const handleStatusUpdate = (status: string) => {
		updateStatus.mutate({ shareToken: token, status: status as any });
	};

	// External drivers: when at dropped_off/awaiting_extras, open close-trip flow (cannot mark completed)
	const handleAddExtrasClick = () => {
		setCloseTripOptionsOpen(true);
	};

	const handleCloseTripOption = (
		option:
			| "close"
			| "close-with-extras"
			| "no-show"
			| "no-show-with-extras"
			| "close-later",
	) => {
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
		return (
			(extrasData.parkingCharges || 0) +
			(extrasData.tollCharges || 0) +
			(extrasData.otherCharges?.amount || 0)
		);
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
			extraType: (extrasData.extraType || "general") as
				| "general"
				| "driver"
				| "operator",
			notes: extrasData.notes || "",
		};
		closeWithExtras.mutate(
			{ shareToken: token, isNoShow, extrasData: extrasForBackend },
			{
				onSuccess: () => {
					setTripConfirmationOpen(false);
					setExtrasData(undefined);
				},
			},
		);
	};

	const handleTripConfirmationBack = () => {
		setTripConfirmationOpen(false);
		setCloseTripExtrasOpen(true);
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
				<Loader2 className="h-12 w-12 animate-spin text-gray-400" />
				<p className="mt-4 text-muted-foreground">Loading job details...</p>
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
				<AlertCircle className="h-12 w-12 text-destructive" />
				<h2 className="mt-4 font-semibold text-xl">Job not found</h2>
				<p className="mt-2 text-center text-muted-foreground">
					The share link may be invalid or expired.
				</p>
			</div>
		);
	}

	const statusConfig =
		BOOKING_STATUS_CONFIG[(booking.status as BookingStatus) ?? "pending"];
	const nextStatus = getNextStatus(booking.status);
	// External drivers can update status except to "completed" - they must add extras and submit
	const isAtCloseStage = ["dropped_off", "awaiting_extras"].includes(
		booking.status,
	);
	const canUpdateStatus =
		!isFinalStatus(booking.status) &&
		!isAtCloseStage &&
		[
			"driver_assigned",
			"confirmed",
			"driver_en_route",
			"arrived_pickup",
			"passenger_on_board",
			"in_progress",
		].includes(booking.status);
	const showAddExtrasButton = isAtCloseStage;

	const isPackageBooking = !!booking.packageId;
	const serviceType = booking.package?.packageServiceType?.rateType;
	const isHourlyService = serviceType === "hourly";
	const serviceName = booking.package?.name;
	const stopsCount = booking.stops?.length ?? 0;

	return (
		<div
			className={cn(
				"flex min-h-screen flex-col bg-gray-50",
				isMobile ? "" : "mx-auto max-w-lg",
			)}
		>
			{/* Header - matches driver app dialog header */}
			<div className="flex-shrink-0 border-gray-200 border-b bg-white p-4">
				<div className="flex items-center justify-between">
					<Link
						to="/"
						className="-m-2 rounded-lg p-2 transition-colors hover:bg-gray-100"
						aria-label="Back"
					>
						<ArrowLeft className="h-5 w-5 text-gray-600" />
					</Link>
					<div className="flex-1 text-center">
						<h1 className="font-bold text-gray-900 text-lg">
							{format(
								new Date(booking.scheduledPickupTime),
								"MMM dd, yyyy h:mm a",
							)}
						</h1>
						<div className="mt-1 flex items-center justify-center gap-2">
							<span className="font-mono text-gray-400 text-xs">
								{booking.referenceNumber || `#${booking.id.slice(-6)}`}
							</span>
							<Badge
								className={cn(
									"text-xs",
									statusConfig?.bg,
									statusConfig?.text,
									statusConfig?.border,
								)}
							>
								{statusConfig?.shortLabel ?? booking.status}
							</Badge>
						</div>
					</div>
					<div className="w-9" />
				</div>
			</div>

			{/* Scrollable content - matches driver app dialog content */}
			<div className="flex-1 overflow-y-auto">
				<div className="space-y-4 p-4">
					{/* Customer info */}
					<div className="rounded-lg border border-gray-200 bg-white p-4">
						<h3 className="mb-2 font-semibold text-gray-900">
							Customer Information
						</h3>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4 text-gray-400" />
								<span className="text-sm">
									{booking.customerName || "Customer"}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Phone className="h-4 w-4 text-gray-400" />
								<span className="text-sm">{booking.customerPhone}</span>
							</div>
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 text-gray-400" />
								<span className="text-sm">
									{booking.passengerCount || 1} passenger
									{(booking.passengerCount || 1) !== 1 ? "s" : ""}
								</span>
							</div>
							{stopsCount > 0 && (
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-gray-400" />
									<span className="text-sm">
										{stopsCount} stop{stopsCount > 1 ? "s" : ""}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Route details - with Google Maps buttons */}
					<div className="rounded-lg border border-gray-200 bg-white p-4">
						<h3 className="mb-3 font-semibold text-gray-900">
							{booking.packageId ? "Service Details" : "Journey Route"}
						</h3>
						<div className="space-y-3">
							{isPackageBooking && (
								<div className="flex items-start gap-3">
									<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
									<div>
										<p className="mb-1 font-medium text-blue-700 text-xs">
											SERVICE
										</p>
										<p className="font-medium text-gray-900 text-sm">
											{serviceName || "Service Booking"}
										</p>
										{isHourlyService && booking.estimatedDuration != null && (
											<p className="mt-1 font-medium text-green-600 text-xs">
												Booked: {Math.round(booking.estimatedDuration / 60)}{" "}
												hour
												{Math.round(booking.estimatedDuration / 60) !== 1
													? "s"
													: ""}
											</p>
										)}
									</div>
								</div>
							)}
							{(!isPackageBooking ||
								isHourlyService ||
								(booking.originAddress &&
									!booking.originAddress.includes("TBD"))) && (
								<>
									{/* Pickup */}
									<div className="flex items-start gap-3">
										<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-green-500" />
										<div className="min-w-0 flex-1">
											<p className="mb-1 font-medium text-green-700 text-xs">
												PICKUP
											</p>
											<button
												type="button"
												onClick={() =>
													window.open(
														getGoogleMapsUrl(
															booking.originAddress,
															booking.originLatitude,
															booking.originLongitude,
														),
														"_blank",
														"noopener,noreferrer",
													)
												}
												className="cursor-pointer border-0 bg-transparent p-0 text-left text-gray-900 text-sm hover:underline"
											>
												{booking.originAddress}
											</button>
										</div>
									</div>

									{/* Stops */}
									{booking.stops?.map(
										(
											stop: {
												id?: string;
												address: string;
												latitude?: number | null;
												longitude?: number | null;
											},
											index: number,
										) => (
											<div
												key={stop.id ?? index}
												className="flex items-start gap-3"
											>
												<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
												<div className="min-w-0 flex-1">
													<p className="mb-1 font-medium text-blue-700 text-xs">
														STOP {index + 1}
													</p>
													<button
														type="button"
														onClick={() =>
															window.open(
																getGoogleMapsUrl(
																	stop.address,
																	stop.latitude,
																	stop.longitude,
																),
																"_blank",
																"noopener,noreferrer",
															)
														}
														className="cursor-pointer border-0 bg-transparent p-0 text-left text-gray-900 text-sm hover:underline"
													>
														{stop.address}
													</button>
												</div>
											</div>
										),
									)}

									{/* Destination */}
									<div className="flex items-start gap-3">
										<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />
										<div className="min-w-0 flex-1">
											<p className="mb-1 font-medium text-red-700 text-xs">
												DROP-OFF
											</p>
											<button
												type="button"
												onClick={() =>
													window.open(
														getGoogleMapsUrl(
															booking.destinationAddress,
															booking.destinationLatitude,
															booking.destinationLongitude,
														),
														"_blank",
														"noopener,noreferrer",
													)
												}
												className="cursor-pointer border-0 bg-transparent p-0 text-left text-gray-900 text-sm hover:underline"
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
					<div className="rounded-lg border border-gray-200 bg-white p-4">
						<h3 className="mb-3 font-semibold text-gray-900">Trip Details</h3>
						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-600">Vehicle:</span>
									<p className="mt-0.5 font-medium">
										{booking.car?.name ||
											booking.carName ||
											"Vehicle not assigned"}
									</p>
								</div>
								{booking.estimatedDistance != null && (
									<div>
										<span className="text-gray-600">Distance:</span>
										<p className="font-medium">
											{formatDistanceKm(booking.estimatedDistance)}
										</p>
									</div>
								)}
								{booking.estimatedDuration != null && !booking.packageId && (
									<div>
										<span className="text-gray-600">Travel Duration:</span>
										<p className="font-medium">
											{Math.round(booking.estimatedDuration / 60)} min
										</p>
									</div>
								)}
								{booking.packageId &&
									booking.package?.packageServiceType?.rateType === "hourly" &&
									booking.estimatedDuration != null && (
										<div>
											<span className="text-gray-600">Client Booked:</span>
											<p className="font-medium text-green-600">
												{Math.round(booking.estimatedDuration / 60)} hour
												{Math.round(booking.estimatedDuration / 60) !== 1
													? "s"
													: ""}
											</p>
										</div>
									)}
								<div>
									<span className="text-gray-600">Luggage:</span>
									<p className="font-medium">
										{booking.luggageCount || 0} piece
										{(booking.luggageCount || 0) !== 1 ? "s" : ""}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Offload details */}
					{booking.bookingType === "offload" && booking.offloadDetails && (
						<div className="rounded-lg border border-gray-200 bg-white p-4">
							<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
								<Car className="h-4 w-4 text-orange-600" />
								Offload Booking Details
							</h3>
							<div className="space-y-2 rounded-lg bg-orange-50 p-3">
								<div>
									<span className="font-medium text-orange-600 text-xs">
										Company:
									</span>
									<p className="font-medium text-orange-800 text-sm">
										{booking.offloadDetails.offloaderName}
									</p>
								</div>
								<div>
									<span className="font-medium text-orange-600 text-xs">
										Job Type:
									</span>
									<p className="text-orange-800 text-sm">
										{booking.offloadDetails.jobType}
									</p>
								</div>
								<div>
									<span className="font-medium text-orange-600 text-xs">
										Vehicle Type:
									</span>
									<p className="text-orange-800 text-sm">
										{booking.offloadDetails.vehicleType}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Special requests */}
					{booking.specialRequests && (
						<div className="rounded-lg border border-gray-200 bg-white p-4">
							<h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
								<MessageSquare className="h-4 w-4 text-blue-600" />
								Special Requests
							</h3>
							<div className="rounded-lg bg-blue-50 p-3">
								<p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
									{booking.specialRequests}
								</p>
							</div>
						</div>
					)}

					{/* Additional notes */}
					{booking.additionalNotes && (
						<div className="rounded-lg border border-gray-200 bg-white p-4">
							<h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
								<MessageSquare className="h-4 w-4 text-orange-600" />
								Additional Notes
							</h3>
							<div className="rounded-lg bg-orange-50 p-3">
								<p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
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
			<div className="flex-shrink-0 border-gray-200 border-t bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
							<User className="h-5 w-5 text-white" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-semibold text-gray-900 text-sm">
								{booking.customerName}
							</p>
							<p className="truncate text-gray-600 text-xs">
								{booking.customerPhone}
							</p>
						</div>
					</div>
					<div className="flex flex-shrink-0 gap-2">
						<Button
							variant="outline"
							size={isMobile ? "default" : "sm"}
							className="h-10 w-10 rounded-full border-green-200 bg-green-50 p-0 shadow-sm transition-shadow hover:border-green-300 hover:bg-green-100 hover:shadow-md"
							onClick={() =>
								(window.location.href = `tel:${booking.customerPhone}`)
							}
						>
							<Phone className="h-5 w-5 text-green-600" />
						</Button>
						<Button
							variant="outline"
							size={isMobile ? "default" : "sm"}
							className="h-10 w-10 rounded-full border-blue-200 bg-blue-50 p-0 shadow-sm transition-shadow hover:border-blue-300 hover:bg-blue-100 hover:shadow-md"
							onClick={() =>
								(window.location.href = `sms:${booking.customerPhone}`)
							}
						>
							<MessageSquare className="h-5 w-5 text-blue-600" />
						</Button>
					</div>
				</div>
			</div>

			{/* Sticky action button */}
			<div
				className={cn(
					"flex-shrink-0 border-gray-200 border-t bg-white p-4",
					isMobile ? "shadow-2xl" : "",
				)}
			>
				{showAddExtrasButton ? (
					<div className="space-y-2">
						<p className="text-center text-gray-500 text-xs">
							Add tolls, parking, waiting time. Admin will finalize the amount.
						</p>
						<Button
							className="h-12 w-full font-semibold text-base"
							onClick={handleAddExtrasClick}
							disabled={
								closeWithExtras.isPending || closeWithoutExtras.isPending
							}
						>
							{closeWithExtras.isPending || closeWithoutExtras.isPending ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									Submitting...
								</>
							) : (
								"Add extras & submit"
							)}
						</Button>
					</div>
				) : canUpdateStatus && nextStatus !== booking.status ? (
					<Button
						className="h-12 w-full font-semibold text-base"
						onClick={() => handleStatusUpdate(nextStatus)}
						disabled={updateStatus.isPending}
					>
						{updateStatus.isPending ? (
							<>
								<Loader2 className="mr-2 h-5 w-5 animate-spin" />
								Updating...
							</>
						) : (
							(BOOKING_STATUS_CONFIG[nextStatus as BookingStatus]
								?.actionLabel ?? `Mark as ${nextStatus.replace("_", " ")}`)
						)}
					</Button>
				) : isFinalStatus(booking.status) ? (
					<div className="py-2 text-center text-gray-500 text-sm">
						This job is {booking.status.replace("_", " ")}.
					</div>
				) : (
					<div className="py-2 text-center text-gray-500 text-sm">
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
