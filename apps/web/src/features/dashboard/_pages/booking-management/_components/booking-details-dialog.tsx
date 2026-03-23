import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Progress } from "@workspace/ui/components/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { format } from "date-fns";
import {
	AlertCircle,
	Calendar,
	Car,
	CheckCircle,
	CircleDot,
	Clock,
	Copy,
	CreditCard,
	DollarSign,
	Edit3,
	Mail,
	MapPin,
	MessageSquare,
	Navigation,
	Package,
	Phone,
	Route,
	Share2,
	Timer,
	TrendingUp,
	User,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceKm } from "@/utils/format";
import { useAssignDriverMutation } from "../_hooks/query/use-assign-driver-mutation";
import { useEditBookingMutation } from "../_hooks/query/use-edit-booking-mutation";
import { useGenerateBookingShareTokenMutation } from "../_hooks/query/use-generate-booking-share-token-mutation";
import { useGetBookingByIdQuery } from "../_hooks/query/use-get-booking-by-id-query";
import { useUpdateBookingStatusMutation } from "../_hooks/query/use-update-booking-status-mutation";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import { AssignCarDialog } from "./assign-car-dialog";
import { AssignDriverDialog } from "./assign-driver-dialog";

const statusOptions = [
	{
		value: "pending",
		label: "Pending",
		color: "warning",
		icon: Timer,
		description: "Awaiting confirmation",
	},
	{
		value: "confirmed",
		label: "Confirmed",
		color: "success",
		icon: CheckCircle,
		description: "Booking confirmed",
	},
	{
		value: "driver_assigned",
		label: "Driver Assigned",
		color: "info",
		icon: UserPlus,
		description: "Driver ready",
	},
	{
		value: "in_progress",
		label: "In Progress",
		color: "primary",
		icon: Navigation,
		description: "Service active",
	},
	{
		value: "awaiting_pricing_review",
		label: "Pricing Review",
		color: "warning",
		icon: AlertCircle,
		description: "Admin must finalize amount",
	},
	{
		value: "completed",
		label: "Completed",
		color: "success",
		icon: CheckCircle,
		description: "Service complete",
	},
	{
		value: "cancelled",
		label: "Cancelled",
		color: "destructive",
		icon: X,
		description: "Booking cancelled",
	},
];

const getStatusProgress = (status: string): number => {
	switch (status) {
		case "pending":
			return 20;
		case "confirmed":
			return 40;
		case "driver_assigned":
			return 60;
		case "in_progress":
			return 80;
		case "awaiting_pricing_review":
			return 90;
		case "completed":
			return 100;
		case "cancelled":
			return 0;
		default:
			return 0;
	}
};

export function BookingDetailsDialog() {
	const {
		isBookingDetailsDialogOpen,
		closeBookingDetailsDialog,
		selectedBookingId,
	} = useBookingManagementModalProvider();

	const [selectedStatus, setSelectedStatus] = useState<string>("");
	const [isAssignDriverDialogOpen, setIsAssignDriverDialogOpen] =
		useState(false);
	const [isAssignCarDialogOpen, setIsAssignCarDialogOpen] = useState(false);
	const [editFinalAmount, setEditFinalAmount] = useState<string>("");
	const [editExtraCharges, setEditExtraCharges] = useState<string>("");
	const [editWaitingTimeCharge, setEditWaitingTimeCharge] =
		useState<string>("");

	const bookingQuery = useGetBookingByIdQuery(
		{ id: selectedBookingId! },
		!!selectedBookingId,
	);

	const updateStatusMutation = useUpdateBookingStatusMutation();
	const assignDriverMutation = useAssignDriverMutation();
	const editBookingMutation = useEditBookingMutation();
	const generateShareTokenMutation = useGenerateBookingShareTokenMutation(
		selectedBookingId ?? undefined,
	);

	const handleStatusUpdate = (newStatus: string) => {
		if (!selectedBookingId || !newStatus) return;

		updateStatusMutation.mutate({
			id: selectedBookingId,
			status: newStatus as any,
		});
	};

	const booking = bookingQuery.data;

	// Debug booking data
	console.log("📋 Dialog state:", {
		isOpen: isBookingDetailsDialogOpen,
		selectedBookingId,
		bookingData: booking,
		isLoading: bookingQuery.isLoading,
		error: bookingQuery.error,
	});
	console.log("📋 Has driverId:", booking?.driverId);
	console.log("📋 Assign driver dialog open:", isAssignDriverDialogOpen);

	// Sync edit amount fields when booking changes
	useEffect(() => {
		if (booking) {
			// For awaiting_pricing_review: leave Final Amount empty so we auto-compute quoted + extras + waiting time
			// Pre-filling with old finalAmount would exclude the waiting time when admin only adds waiting charge
			const isAwaitingPricing = booking.status === "awaiting_pricing_review";
			setEditFinalAmount(
				!isAwaitingPricing && booking.finalAmount != null
					? String(booking.finalAmount)
					: "",
			);
			setEditExtraCharges(
				booking.extraCharges != null && booking.extraCharges > 0
					? String(booking.extraCharges)
					: "",
			);
			setEditWaitingTimeCharge("");
		}
	}, [
		booking?.id,
		booking?.finalAmount,
		booking?.extraCharges,
		booking?.status,
	]);

	const handleFinalizeAmount = () => {
		if (!selectedBookingId || !booking) return;
		const finalAmountVal = editFinalAmount
			? Number.parseFloat(editFinalAmount)
			: undefined;
		const waitingTimeChargeVal = editWaitingTimeCharge
			? Number.parseFloat(editWaitingTimeCharge)
			: 0;
		const existingExtraCharges = booking.extraCharges ?? 0;
		const totalExtraCharges =
			existingExtraCharges +
			(Number.isNaN(waitingTimeChargeVal) ? 0 : waitingTimeChargeVal);
		const quotedAmount = booking.quotedAmount ?? 0;
		// Always set finalAmount: use admin input, or compute quotedAmount + totalExtraCharges (includes waiting time)
		const finalAmount =
			finalAmountVal != null && !Number.isNaN(finalAmountVal)
				? finalAmountVal
				: Math.round((quotedAmount + totalExtraCharges) * 100) / 100;
		const data: Record<string, unknown> = {
			status: "completed",
			extraCharges: totalExtraCharges,
			finalAmount,
		};
		editBookingMutation.mutate(
			{ id: selectedBookingId, data },
			{
				onSuccess: () => {
					bookingQuery.refetch();
					toast.success("Amount finalized. Client will receive summary email.");
					closeBookingDetailsDialog();
				},
			},
		);
	};

	if (!booking) return null;

	const currentStatus = statusOptions.find((s) => s.value === booking.status);
	const StatusIcon = currentStatus?.icon || Timer;
	const packageName =
		booking.bookingType === "package" &&
		(booking as { package?: { name: string } }).package?.name;

	return (
		<>
			<Dialog
				open={isBookingDetailsDialogOpen}
				onOpenChange={closeBookingDetailsDialog}
			>
				<DialogContent
					className="flex max-h-[95vh] flex-col overflow-hidden p-0 sm:max-w-4xl"
					showCloseButton={false}
				>
					{/* Simple Header */}
					<div className="flex min-w-0 flex-shrink-0 items-center justify-between gap-4 border-b bg-soft-beige px-6 pt-6 pb-4">
						<div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 overflow-hidden">
							<h2 className="shrink-0 font-semibold text-xl">
								Booking Details
							</h2>
							<Badge variant="outline" className="shrink-0 text-xs">
								{booking.bookingType === "package"
									? "Package"
									: booking.bookingType === "guest"
										? "Guest"
										: "Custom"}
							</Badge>
							{packageName && (
								<span className="min-w-0 truncate font-medium text-gray-600 text-sm">
									{packageName}
								</span>
							)}
							<Badge
								variant={(currentStatus?.color as any) || "secondary"}
								className="shrink-0 text-xs"
							>
								{booking.status.replace("_", " ").toUpperCase()}
							</Badge>
							{(booking as { paymentStatus?: string }).paymentStatus && (
								<Badge
									variant={
										(booking as { paymentStatus?: string }).paymentStatus ===
										"payment_captured"
											? "default"
											: (booking as { paymentStatus?: string })
														.paymentStatus === "payment_authorized" ||
													(booking as { paymentStatus?: string })
														.paymentStatus === "awaiting_capture"
												? "secondary"
												: (booking as { paymentStatus?: string })
															.paymentStatus === "payment_failed" ||
														(booking as { paymentStatus?: string })
															.paymentStatus === "payment_cancelled"
													? "destructive"
													: "outline"
									}
									className="shrink-0 text-xs"
								>
									{{
										pending_payment: "Pending Payment",
										payment_authorized: "Authorized",
										awaiting_capture: "Awaiting Capture",
										payment_captured: "Captured",
										payment_failed: "Failed",
										payment_cancelled: "Cancelled",
										refunded: "Refunded",
									}[
										(booking as { paymentStatus?: string }).paymentStatus ?? ""
									] ?? "Payment"}
								</Badge>
							)}
						</div>
						<div className="flex-shrink-0 text-right">
							<div className="font-bold text-lg text-primary">
								${booking.quotedAmount.toFixed(2)}
							</div>
							<div className="font-mono text-gray-500 text-xs">
								#{(booking as any).referenceNumber || "N/A"}
							</div>
						</div>
					</div>

					{/* Content in simple grid layout */}
					<div className="max-h-[calc(95vh-140px)] min-w-0 overflow-y-auto overflow-x-hidden p-6">
						<div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-4">
							{/* Left: Customer & Route Info */}
							<div className="min-w-0 space-y-4 overflow-hidden lg:col-span-2">
								{/* Customer */}
								<div className="overflow-hidden rounded-lg border bg-soft-beige p-4">
									<div className="mb-3 flex items-center gap-3">
										<User className="h-5 w-5 shrink-0 text-primary" />
										<h3 className="font-semibold">Customer</h3>
									</div>
									<div className="min-w-0 space-y-2 overflow-hidden">
										{packageName && (
											<div className="flex min-w-0 items-center gap-2 text-sm">
												<Package className="h-4 w-4 shrink-0 text-primary" />
												<span className="shrink-0 text-gray-600">Package:</span>
												<span className="break-words font-medium text-primary">
													{packageName}
												</span>
											</div>
										)}
										<div className="break-words font-bold text-lg">
											{booking.customerName}
										</div>
										<div className="text-gray-600 text-sm">
											{booking.passengerCount} passenger
											{booking.passengerCount > 1 ? "s" : ""}
										</div>
										<div className="flex flex-wrap gap-4 break-all text-sm">
											<a
												href={`tel:${booking.customerPhone}`}
												className="break-all text-primary hover:underline"
											>
												{booking.customerPhone}
											</a>
											{booking.customerEmail && (
												<a
													href={`mailto:${booking.customerEmail}`}
													className="break-all text-primary hover:underline"
												>
													{booking.customerEmail}
												</a>
											)}
										</div>
									</div>
								</div>

								{/* Route */}
								<div className="overflow-hidden rounded-lg border bg-soft-beige p-4">
									<div className="mb-3 flex items-center gap-3">
										<Navigation className="h-5 w-5 shrink-0 text-primary" />
										<h3 className="font-semibold">Route</h3>
									</div>
									<div className="space-y-4">
										{/* Origin */}
										<div className="flex items-start gap-3">
											<div className="relative mt-1">
												<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-md">
													<Navigation className="h-2 w-2 text-white" />
												</div>
												{/* Connector line */}
												{(booking.stops && booking.stops.length > 0) ||
												booking.destinationAddress ? (
													<div className="-translate-x-1/2 absolute top-4 left-1/2 h-5 w-0.5 transform bg-gradient-to-b from-green-500 to-blue-400" />
												) : null}
											</div>
											<div className="min-w-0 flex-1 pt-0.5">
												<div className="mb-1 font-medium text-green-700 text-xs">
													PICKUP LOCATION
												</div>
												<div className="break-words font-medium text-gray-900 text-sm leading-relaxed">
													{booking.originAddress}
												</div>
											</div>
										</div>

										{/* Stops (if any) */}
										{booking.stops && booking.stops.length > 0 && (
											<>
												{booking.stops.map((stop: any, index: number) => (
													<div
														key={stop.id || index}
														className="flex items-start gap-3"
													>
														<div className="relative mt-1">
															<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-md">
																<CircleDot className="h-2 w-2 text-white" />
															</div>
															{/* Connector line */}
															<div className="-translate-x-1/2 absolute top-4 left-1/2 h-5 w-0.5 transform bg-gradient-to-b from-blue-400 to-red-400" />
														</div>
														<div className="min-w-0 flex-1 pt-0.5">
															<div className="mb-1 font-medium text-blue-700 text-xs">
																STOP {index + 1}
															</div>
															<div className="break-words font-medium text-gray-900 text-sm leading-relaxed">
																{stop.address}
															</div>
														</div>
													</div>
												))}
											</>
										)}

										{/* Destination */}
										<div className="flex items-start gap-3">
											<div className="relative mt-1">
												<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-md">
													<MapPin className="h-2 w-2 text-white" />
												</div>
											</div>
											<div className="min-w-0 flex-1 pt-0.5">
												<div className="mb-1 font-medium text-red-700 text-xs">
													DROP-OFF LOCATION
												</div>
												<div className="break-words font-medium text-gray-900 text-sm leading-relaxed">
													{booking.destinationAddress}
												</div>
											</div>
										</div>
									</div>

									{/* Journey Summary */}
									<div className="mt-4 border-gray-100 border-t pt-3">
										<div className="flex items-center justify-between text-sm">
											{booking.estimatedDistance && (
												<div className="text-gray-600">
													<span className="font-medium">
														{formatDistanceKm(booking.estimatedDistance)}
													</span>
												</div>
											)}
											{booking.estimatedDuration && (
												<div className="text-gray-600">
													<span className="font-medium">
														{Math.round(booking.estimatedDuration / 60)} min
													</span>
												</div>
											)}
											{booking.stops && booking.stops.length > 0 && (
												<div className="text-blue-600">
													<span className="font-medium">
														{booking.stops.length} stop
														{booking.stops.length > 1 ? "s" : ""}
													</span>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Schedule */}
								<div className="overflow-hidden rounded-lg border bg-soft-beige p-4">
									<div className="mb-3 flex items-center gap-3">
										<Calendar className="h-5 w-5 shrink-0 text-primary" />
										<h3 className="font-semibold">Schedule</h3>
									</div>
									<div className="space-y-2">
										<div>
											<div className="mb-1 text-gray-500 text-xs">
												PICKUP TIME
											</div>
											<div className="font-bold text-primary">
												{format(
													new Date(booking.scheduledPickupTime),
													"MMM dd, h:mm a",
												)}
											</div>
										</div>
										{booking.actualPickupTime && (
											<div>
												<div className="mb-1 text-gray-500 text-xs">
													ACTUAL PICKUP
												</div>
												<div className="font-medium">
													{format(
														new Date(booking.actualPickupTime),
														"MMM dd, h:mm a",
													)}
												</div>
											</div>
										)}
										{booking.actualDropoffTime && (
											<div>
												<div className="mb-1 text-gray-500 text-xs">
													COMPLETED
												</div>
												<div className="font-medium">
													{format(
														new Date(booking.actualDropoffTime),
														"MMM dd, h:mm a",
													)}
												</div>
											</div>
										)}
									</div>
								</div>

								{/* Share Links */}
								<div className="overflow-hidden rounded-lg border bg-soft-beige p-4">
									<div className="mb-3 flex items-center gap-3">
										<Share2 className="h-5 w-5 shrink-0 text-primary" />
										<h3 className="font-semibold">Share Links</h3>
									</div>
									{(booking as any).shareToken ? (
										<div className="space-y-3">
											<div className="min-w-0 overflow-hidden">
												<p className="mb-1 text-gray-500 text-xs">
													Client tracking (share with customer)
												</p>
												<div className="flex min-w-0 gap-2">
													<Input
														readOnly
														value={`${typeof window !== "undefined" ? window.location.origin : ""}/track/${(booking as any).shareToken}`}
														className="min-w-0 flex-1 overflow-hidden font-mono text-sm"
													/>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															navigator.clipboard.writeText(
																`${window.location.origin}/track/${(booking as any).shareToken}`,
															);
															toast.success("Tracking link copied");
														}}
													>
														<Copy className="h-4 w-4" />
													</Button>
												</div>
											</div>
											<div className="min-w-0 overflow-hidden">
												<p className="mb-1 text-gray-500 text-xs">
													Driver job (share with driver)
												</p>
												<div className="flex min-w-0 gap-2">
													<Input
														readOnly
														value={`${typeof window !== "undefined" ? window.location.origin : ""}/driver-job/${(booking as any).shareToken}`}
														className="min-w-0 flex-1 overflow-hidden font-mono text-sm"
													/>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															navigator.clipboard.writeText(
																`${window.location.origin}/driver-job/${(booking as any).shareToken}`,
															);
															toast.success("Driver link copied");
														}}
													>
														<Copy className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</div>
									) : (
										<div>
											<p className="mb-2 text-muted-foreground text-sm">
												Generate shareable links for client tracking and driver
												updates.
											</p>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													generateShareTokenMutation.mutate({
														bookingId: selectedBookingId!,
													})
												}
												disabled={generateShareTokenMutation.isPending}
											>
												{generateShareTokenMutation.isPending
													? "Generating..."
													: "Generate Share Links"}
											</Button>
										</div>
									)}
								</div>

								{/* Vehicle & Notes */}
								{(booking.car ||
									booking.specialRequests ||
									(booking as any).additionalNotes) && (
									<div className="space-y-3">
										{booking.car && (
											<div className="overflow-hidden rounded-lg border bg-soft-beige p-4">
												<div className="mb-2 flex items-center gap-3">
													<Car className="h-5 w-5 shrink-0 text-primary" />
													<h3 className="font-semibold">Vehicle</h3>
												</div>
												<div className="break-words font-medium">
													{booking.car.name}
												</div>
											</div>
										)}
										{booking.specialRequests && (
											<div className="overflow-hidden rounded-lg border bg-soft-beige p-4">
												<div className="mb-2 flex items-center gap-3">
													<MessageSquare className="h-5 w-5 shrink-0 text-blue-600" />
													<h3 className="font-semibold">Special Requests</h3>
												</div>
												<div className="rounded-lg bg-blue-50 p-3">
													<div className="whitespace-pre-wrap break-words text-gray-700 text-sm leading-relaxed">
														{booking.specialRequests}
													</div>
												</div>
											</div>
										)}
										{(booking as any).additionalNotes && (
											<div className="overflow-hidden rounded-lg border bg-soft-beige p-4">
												<div className="mb-2 flex items-center gap-3">
													<MessageSquare className="h-5 w-5 shrink-0 text-orange-600" />
													<h3 className="font-semibold">Additional Notes</h3>
												</div>
												<div className="rounded-lg bg-orange-50 p-3">
													<div className="whitespace-pre-wrap break-words text-gray-700 text-sm leading-relaxed">
														{(booking as any).additionalNotes}
													</div>
												</div>
											</div>
										)}
									</div>
								)}
							</div>

							{/* Right: Actions & Pricing */}
							<div className="min-w-0 space-y-4 overflow-hidden lg:col-span-2">
								{/* Actions */}
								<div className="overflow-hidden rounded-lg border bg-soft-beige p-4">
									<div className="mb-3 flex items-center gap-3">
										<Edit3 className="h-5 w-5 shrink-0 text-primary" />
										<h3 className="font-semibold">Actions</h3>
									</div>
									<div className="space-y-3">
										{/* Status Update */}
										<div className="flex min-w-0 items-center gap-3">
											<Select
												value={selectedStatus}
												onValueChange={setSelectedStatus}
											>
												<SelectTrigger className="min-w-0 flex-1">
													<SelectValue placeholder="Update status" />
												</SelectTrigger>
												<SelectContent>
													{statusOptions.map((status) => {
														const Icon = status.icon;
														return (
															<SelectItem
																key={status.value}
																value={status.value}
															>
																<div className="flex items-center gap-2">
																	<Icon className="h-4 w-4" />
																	<span>{status.label}</span>
																</div>
															</SelectItem>
														);
													})}
												</SelectContent>
											</Select>
											<Button
												onClick={() => handleStatusUpdate(selectedStatus)}
												disabled={
													!selectedStatus || updateStatusMutation.isPending
												}
												className="shrink-0 bg-primary hover:bg-primary/90"
											>
												{updateStatusMutation.isPending ? (
													<Timer className="h-4 w-4 animate-spin" />
												) : (
													"Update"
												)}
											</Button>
										</div>

										{/* Car Assignment */}
										<div className="flex min-w-0 items-center gap-3">
											<div className="min-w-0 flex-1 overflow-hidden">
												{booking.car ? (
													<div
														className="truncate text-sm"
														title={booking.car.name}
													>
														<span className="text-gray-500">Car: </span>
														<span className="font-medium">
															{booking.car.name}
														</span>
													</div>
												) : (
													<span className="text-gray-500 text-sm">
														No car assigned
													</span>
												)}
											</div>
											<Button
												onClick={() => setIsAssignCarDialogOpen(true)}
												variant="outline"
												className="shrink-0 border-primary text-primary hover:bg-primary/5"
											>
												<Car className="mr-2 h-4 w-4" />
												{booking.car ? "Change" : "Assign"} Car
											</Button>
										</div>

										{/* Driver Assignment */}
										<div className="flex min-w-0 items-center gap-3">
											<div className="min-w-0 flex-1 overflow-hidden">
												{booking.driverId ? (
													<div
														className="truncate text-sm"
														title={booking.driverId}
													>
														<span className="text-gray-500">Driver: </span>
														<span className="font-medium">
															{booking.driverId}
														</span>
													</div>
												) : (
													<span className="text-gray-500 text-sm">
														No driver assigned
													</span>
												)}
											</div>
											{[
												"confirmed",
												"driver_assigned",
												"driver_en_route",
												"arrived_pickup",
												"passenger_on_board",
												"in_progress",
											].includes(booking.status) ? (
												<Button
													onClick={() => setIsAssignDriverDialogOpen(true)}
													variant="outline"
													className="shrink-0 border-primary text-primary hover:bg-primary/5"
												>
													<UserPlus className="mr-2 h-4 w-4" />
													{booking.driverId ? "Reassign" : "Assign"} Driver
												</Button>
											) : (
												<Button
													disabled
													variant="outline"
													className="shrink-0 opacity-50"
												>
													<UserPlus className="mr-2 h-4 w-4 opacity-50" />
													Assign Driver
													<span className="ml-2 text-xs">(Confirm first)</span>
												</Button>
											)}
										</div>
									</div>
								</div>

								{/* Pricing */}
								<div className="overflow-hidden rounded-lg border bg-soft-beige p-4">
									<div className="mb-3 flex items-center gap-3">
										<CreditCard className="h-5 w-5 shrink-0 text-primary" />
										<h3 className="font-semibold">Pricing</h3>
										{(() => {
											const ps = (booking as { paymentStatus?: string })
												.paymentStatus;
											if (!ps)
												return (
													<span className="ml-auto text-muted-foreground text-xs">
														—
													</span>
												);
											const labels: Record<string, string> = {
												pending_payment: "Pending Payment",
												payment_authorized: "Authorized",
												awaiting_capture: "Awaiting Capture",
												payment_captured: "Captured",
												payment_failed: "Failed",
												payment_cancelled: "Cancelled",
												refunded: "Refunded",
											};
											const variant =
												ps === "payment_captured"
													? "default"
													: ps === "payment_authorized" ||
															ps === "awaiting_capture"
														? "secondary"
														: ps === "payment_failed" ||
																ps === "payment_cancelled"
															? "destructive"
															: "outline";
											return (
												<Badge variant={variant as any} className="ml-auto">
													{labels[ps] ?? ps.replace(/_/g, " ")}
												</Badge>
											);
										})()}
									</div>
									<div className="space-y-2">
										{booking.bookingType === "package" ? (
											<div className="mb-2 text-gray-600 text-sm">
												Package booking - Fixed pricing
											</div>
										) : (
											<div className="space-y-1 text-sm">
												{booking.baseFare != null && booking.baseFare > 0 && (
													<div className="flex justify-between">
														<span>Base fare:</span>
														<span>${booking.baseFare.toFixed(2)}</span>
													</div>
												)}
												{booking.distanceFare != null &&
													booking.distanceFare > 0 && (
														<div className="flex justify-between">
															<span>Distance:</span>
															<span>${booking.distanceFare.toFixed(2)}</span>
														</div>
													)}
												{booking.timeFare != null && booking.timeFare > 0 && (
													<div className="flex justify-between">
														<span>Time:</span>
														<span>${booking.timeFare.toFixed(2)}</span>
													</div>
												)}
											</div>
										)}
										{/* Fare breakdown: tolls, parking, waiting time, other (for all booking types) */}
										{(() => {
											const extras = (
												booking as {
													extras?: Array<{
														tollCharges?: number;
														parkingCharges?: number;
														otherChargesAmount?: number;
													}>;
												}
											)?.extras;
											const tollCharges =
												extras?.reduce((s, e) => s + (e.tollCharges ?? 0), 0) ??
												0;
											const parkingCharges =
												extras?.reduce(
													(s, e) => s + (e.parkingCharges ?? 0),
													0,
												) ?? 0;
											const otherCharges =
												extras?.reduce(
													(s, e) => s + (e.otherChargesAmount ?? 0),
													0,
												) ?? 0;
											const extraTotal = booking.extraCharges ?? 0;
											const waitingTimeCharge = Math.max(
												0,
												extraTotal -
													tollCharges -
													parkingCharges -
													otherCharges,
											);
											const hasBreakdown =
												tollCharges > 0 ||
												parkingCharges > 0 ||
												waitingTimeCharge > 0 ||
												otherCharges > 0;
											if (!hasBreakdown && extraTotal > 0) {
												return (
													<div className="flex justify-between text-sm">
														<span>Extra charges:</span>
														<span>${extraTotal.toFixed(2)}</span>
													</div>
												);
											}
											return hasBreakdown ? (
												<div className="space-y-1 text-sm">
													{tollCharges > 0 && (
														<div className="flex justify-between">
															<span>Tolls:</span>
															<span>${tollCharges.toFixed(2)}</span>
														</div>
													)}
													{parkingCharges > 0 && (
														<div className="flex justify-between">
															<span>Parking:</span>
															<span>${parkingCharges.toFixed(2)}</span>
														</div>
													)}
													{waitingTimeCharge > 0 && (
														<div className="flex justify-between">
															<span>Waiting time:</span>
															<span>${waitingTimeCharge.toFixed(2)}</span>
														</div>
													)}
													{otherCharges > 0 && (
														<div className="flex justify-between">
															<span>Other charges:</span>
															<span>${otherCharges.toFixed(2)}</span>
														</div>
													)}
												</div>
											) : null;
										})()}
										<div className="mt-2 border-t pt-2">
											<div className="flex items-center justify-between">
												<span className="font-semibold">Total Amount:</span>
												<span className="font-bold text-lg text-primary">
													${booking.quotedAmount.toFixed(2)}
												</span>
											</div>
											{booking.finalAmount &&
												booking.finalAmount !== booking.quotedAmount && (
													<div className="mt-1 flex items-center justify-between">
														<span className="font-semibold">Final Amount:</span>
														<span className="font-bold text-lg text-primary">
															${booking.finalAmount.toFixed(2)}
														</span>
													</div>
												)}
										</div>

										{/* Finalize Amount - for bookings awaiting pricing review */}
										{booking.status === "awaiting_pricing_review" && (
											<div className="mt-4 space-y-3 rounded-lg border-amber-200 border-t bg-amber-50/50 p-3 pt-4">
												<div className="flex items-center gap-2 font-medium text-amber-800">
													<AlertCircle className="h-4 w-4" />
													<span>Finalize amount & send client summary</span>
												</div>
												{/* Driver's waiting time - from booking extras */}
												{(() => {
													const extras = (
														booking as
															| {
																	extras?: Array<{
																		additionalWaitTime?: number | null;
																	}>;
															  }
															| undefined
													)?.extras;
													const totalWaitMins =
														extras?.reduce(
															(sum, e) => sum + (e.additionalWaitTime ?? 0),
															0,
														) ?? 0;
													return totalWaitMins > 0 ? (
														<div className="rounded border border-amber-200 bg-amber-100/80 p-2">
															<div className="font-medium text-amber-800 text-sm">
																Driver added waiting time
															</div>
															<div className="font-semibold text-amber-900 text-lg">
																{totalWaitMins} minutes
															</div>
														</div>
													) : null;
												})()}
												<p className="text-amber-700 text-sm">
													Tolls and parking (from driver) are automatically
													included in the total. Add the waiting time charge,
													then complete to send the summary email to the client.
												</p>
												<div className="grid grid-cols-2 gap-3">
													<div>
														<label className="mb-1 block font-medium text-gray-600 text-xs">
															Waiting time charge ($)
														</label>
														<Input
															type="number"
															step="0.01"
															min="0"
															placeholder="0.00"
															value={editWaitingTimeCharge}
															onChange={(e) =>
																setEditWaitingTimeCharge(e.target.value)
															}
														/>
													</div>
													<div>
														<label className="mb-1 block font-medium text-gray-600 text-xs">
															Final Amount ($)
														</label>
														<Input
															type="number"
															step="0.01"
															placeholder={String(
																Math.round(
																	((booking.quotedAmount ?? 0) +
																		(booking.extraCharges ?? 0) +
																		(Number(editWaitingTimeCharge) || 0)) *
																		100,
																) / 100,
															)}
															value={editFinalAmount}
															onChange={(e) =>
																setEditFinalAmount(e.target.value)
															}
														/>
													</div>
												</div>
												{booking.extraCharges != null &&
													booking.extraCharges > 0 && (
														<p className="text-amber-700 text-xs">
															Tolls & parking (auto-included): $
															{booking.extraCharges.toFixed(2)}
														</p>
													)}
												<Button
													onClick={handleFinalizeAmount}
													disabled={editBookingMutation.isPending}
													className="w-full bg-amber-600 hover:bg-amber-700"
												>
													{editBookingMutation.isPending ? (
														<Timer className="h-4 w-4 animate-spin" />
													) : (
														"Finalize Amount & Send Summary"
													)}
												</Button>
											</div>
										)}
									</div>
								</div>

								{/* Timeline */}
								<div className="overflow-hidden rounded-lg border bg-soft-beige p-4">
									<div className="mb-3 flex items-center gap-3">
										<Clock className="h-5 w-5 shrink-0 text-primary" />
										<h3 className="font-semibold">Timeline</h3>
									</div>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>Created:</span>
											<span>
												{booking.createdAt
													? format(
															new Date(booking.createdAt),
															"MMM dd, h:mm a",
														)
													: "N/A"}
											</span>
										</div>
										{booking.confirmedAt && (
											<div className="flex justify-between">
												<span>Confirmed:</span>
												<span>
													{format(
														new Date(booking.confirmedAt),
														"MMM dd, h:mm a",
													)}
												</span>
											</div>
										)}
										{booking.serviceStartedAt && (
											<div className="flex justify-between">
												<span>Started:</span>
												<span>
													{format(
														new Date(booking.serviceStartedAt),
														"MMM dd, h:mm a",
													)}
												</span>
											</div>
										)}
										{booking.serviceCompletedAt && (
											<div className="flex justify-between">
												<span>Completed:</span>
												<span>
													{format(
														new Date(booking.serviceCompletedAt),
														"MMM dd, h:mm a",
													)}
												</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Footer with Close Button */}
					<div className="flex justify-end border-t bg-gray-50 p-4">
						<Button variant="outline" onClick={closeBookingDetailsDialog}>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Assign Driver Dialog - Outside main dialog to avoid z-index issues */}
			<AssignDriverDialog
				booking={booking}
				open={isAssignDriverDialogOpen}
				onOpenChange={setIsAssignDriverDialogOpen}
			/>

			{/* Assign Car Dialog - Outside main dialog to avoid z-index issues */}
			<AssignCarDialog
				booking={booking}
				open={isAssignCarDialogOpen}
				onOpenChange={setIsAssignCarDialogOpen}
			/>
		</>
	);
}
