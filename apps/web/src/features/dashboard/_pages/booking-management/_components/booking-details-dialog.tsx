import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from "@workspace/ui/components/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Progress } from "@workspace/ui/components/progress";
import { useGetBookingByIdQuery } from "../_hooks/query/use-get-booking-by-id-query";
import { useGenerateBookingShareTokenMutation } from "../_hooks/query/use-generate-booking-share-token-mutation";
import { useUpdateBookingStatusMutation } from "../_hooks/query/use-update-booking-status-mutation";
import { useAssignDriverMutation } from "../_hooks/query/use-assign-driver-mutation";
import { useEditBookingMutation } from "../_hooks/query/use-edit-booking-mutation";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import { AssignDriverDialog } from "./assign-driver-dialog";
import { AssignCarDialog } from "./assign-car-dialog";
import { format } from "date-fns";
import { formatDistanceKm } from "@/utils/format";
import {
	User,
	Phone,
	Mail,
	MapPin,
	Clock,
	Car,
	DollarSign,
	Package,
	Route,
	Calendar,
	Users,
	UserPlus,
	Navigation,
	CheckCircle,
	AlertCircle,
	Timer,
	TrendingUp,
	CreditCard,
	Edit3,
	X,
	CircleDot,
	Share2,
	Copy,
	MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const statusOptions = [
	{ value: "pending", label: "Pending", color: "warning", icon: Timer, description: "Awaiting confirmation" },
	{ value: "confirmed", label: "Confirmed", color: "success", icon: CheckCircle, description: "Booking confirmed" },
	{ value: "driver_assigned", label: "Driver Assigned", color: "info", icon: UserPlus, description: "Driver ready" },
	{ value: "in_progress", label: "In Progress", color: "primary", icon: Navigation, description: "Service active" },
	{ value: "awaiting_pricing_review", label: "Pricing Review", color: "warning", icon: AlertCircle, description: "Admin must finalize amount" },
	{ value: "completed", label: "Completed", color: "success", icon: CheckCircle, description: "Service complete" },
	{ value: "cancelled", label: "Cancelled", color: "destructive", icon: X, description: "Booking cancelled" },
];

const getStatusProgress = (status: string): number => {
	switch (status) {
		case "pending": return 20;
		case "confirmed": return 40;
		case "driver_assigned": return 60;
		case "in_progress": return 80;
		case "awaiting_pricing_review": return 90;
		case "completed": return 100;
		case "cancelled": return 0;
		default: return 0;
	}
};

export function BookingDetailsDialog() {
	const {
		isBookingDetailsDialogOpen,
		closeBookingDetailsDialog,
		selectedBookingId
	} = useBookingManagementModalProvider();

	const [selectedStatus, setSelectedStatus] = useState<string>("");
	const [isAssignDriverDialogOpen, setIsAssignDriverDialogOpen] = useState(false);
	const [isAssignCarDialogOpen, setIsAssignCarDialogOpen] = useState(false);
	const [editFinalAmount, setEditFinalAmount] = useState<string>("");
	const [editExtraCharges, setEditExtraCharges] = useState<string>("");
	const [editWaitingTimeCharge, setEditWaitingTimeCharge] = useState<string>("");

	const bookingQuery = useGetBookingByIdQuery(
		{ id: selectedBookingId! },
		!!selectedBookingId
	);

	const updateStatusMutation = useUpdateBookingStatusMutation();
	const assignDriverMutation = useAssignDriverMutation();
	const editBookingMutation = useEditBookingMutation();
	const generateShareTokenMutation = useGenerateBookingShareTokenMutation(selectedBookingId ?? undefined);

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
		error: bookingQuery.error
	});
	console.log("📋 Has driverId:", booking?.driverId);
	console.log("📋 Assign driver dialog open:", isAssignDriverDialogOpen);

	// Sync edit amount fields when booking changes
	useEffect(() => {
		if (booking) {
			// For awaiting_pricing_review: leave Final Amount empty so we auto-compute quoted + extras + waiting time
			// Pre-filling with old finalAmount would exclude the waiting time when admin only adds waiting charge
			const isAwaitingPricing = booking.status === "awaiting_pricing_review";
			setEditFinalAmount(!isAwaitingPricing && booking.finalAmount != null ? String(booking.finalAmount) : "");
			setEditExtraCharges(booking.extraCharges != null && booking.extraCharges > 0 ? String(booking.extraCharges) : "");
			setEditWaitingTimeCharge("");
		}
	}, [booking?.id, booking?.finalAmount, booking?.extraCharges, booking?.status]);

	const handleFinalizeAmount = () => {
		if (!selectedBookingId || !booking) return;
		const finalAmountVal = editFinalAmount ? parseFloat(editFinalAmount) : undefined;
		const waitingTimeChargeVal = editWaitingTimeCharge ? parseFloat(editWaitingTimeCharge) : 0;
		const existingExtraCharges = booking.extraCharges ?? 0;
		const totalExtraCharges = existingExtraCharges + (Number.isNaN(waitingTimeChargeVal) ? 0 : waitingTimeChargeVal);
		const quotedAmount = booking.quotedAmount ?? 0;
		// Always set finalAmount: use admin input, or compute quotedAmount + totalExtraCharges (includes waiting time)
		const finalAmount = (finalAmountVal != null && !Number.isNaN(finalAmountVal))
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
			}
		);
	};

	if (!booking) return null;

	const currentStatus = statusOptions.find(s => s.value === booking.status);
	const StatusIcon = currentStatus?.icon || Timer;
	const packageName = booking.bookingType === "package" && (booking as { package?: { name: string } }).package?.name;

	return (
		<>
			<Dialog open={isBookingDetailsDialogOpen} onOpenChange={closeBookingDetailsDialog}>
			<DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-hidden p-0 flex flex-col" showCloseButton={false}>
				{/* Simple Header */}
				<div className="flex items-center justify-between gap-4 pt-6 px-6 pb-4 border-b bg-soft-beige flex-shrink-0 min-w-0">
					<div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden flex-wrap">
						<h2 className="text-xl font-semibold shrink-0">Booking Details</h2>
						<Badge variant="outline" className="text-xs shrink-0">
							{booking.bookingType === "package" ? "Package" : booking.bookingType === "guest" ? "Guest" : "Custom"}
						</Badge>
						{packageName && (
							<span className="text-sm text-gray-600 font-medium truncate min-w-0">{packageName}</span>
						)}
						<Badge variant={currentStatus?.color as any || "secondary"} className="text-xs shrink-0">
							{booking.status.replace("_", " ").toUpperCase()}
						</Badge>
					</div>
					<div className="text-right flex-shrink-0">
						<div className="text-lg font-bold text-primary">
							${booking.quotedAmount.toFixed(2)}
						</div>
						<div className="text-xs text-gray-500 font-mono">#{(booking as any).referenceNumber || 'N/A'}</div>
					</div>
				</div>

				{/* Content in simple grid layout */}
				<div className="p-6 overflow-y-auto overflow-x-hidden max-h-[calc(95vh-140px)] min-w-0">
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-w-0">
						
						{/* Left: Customer & Route Info */}
						<div className="lg:col-span-2 space-y-4 min-w-0 overflow-hidden">
							{/* Customer */}
							<div className="bg-soft-beige p-4 rounded-lg border overflow-hidden">
								<div className="flex items-center gap-3 mb-3">
									<User className="h-5 w-5 text-primary shrink-0" />
									<h3 className="font-semibold">Customer</h3>
								</div>
								<div className="space-y-2 min-w-0 overflow-hidden">
									{packageName && (
										<div className="flex items-center gap-2 text-sm min-w-0">
											<Package className="h-4 w-4 text-primary shrink-0" />
											<span className="text-gray-600 shrink-0">Package:</span>
											<span className="font-medium text-primary break-words">{packageName}</span>
										</div>
									)}
									<div className="font-bold text-lg break-words">{booking.customerName}</div>
									<div className="text-sm text-gray-600">{booking.passengerCount} passenger{booking.passengerCount > 1 ? 's' : ''}</div>
									<div className="flex flex-wrap gap-4 text-sm break-all">
										<a href={`tel:${booking.customerPhone}`} className="text-primary hover:underline break-all">{booking.customerPhone}</a>
										{booking.customerEmail && (
											<a href={`mailto:${booking.customerEmail}`} className="text-primary hover:underline break-all">{booking.customerEmail}</a>
										)}
									</div>
								</div>
							</div>

							{/* Route */}
							<div className="bg-soft-beige p-4 rounded-lg border overflow-hidden">
								<div className="flex items-center gap-3 mb-3">
									<Navigation className="h-5 w-5 text-primary shrink-0" />
									<h3 className="font-semibold">Route</h3>
								</div>
								<div className="space-y-4">
									{/* Origin */}
									<div className="flex items-start gap-3">
										<div className="relative mt-1">
											<div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
												<Navigation className="w-2 h-2 text-white" />
											</div>
											{/* Connector line */}
											{(booking.stops && booking.stops.length > 0) || booking.destinationAddress ? (
												<div className="absolute left-1/2 top-4 w-0.5 h-5 bg-gradient-to-b from-green-500 to-blue-400 transform -translate-x-1/2"></div>
											) : null}
										</div>
										<div className="flex-1 min-w-0 pt-0.5">
											<div className="text-xs text-green-700 font-medium mb-1">PICKUP LOCATION</div>
											<div className="font-medium text-gray-900 text-sm break-words leading-relaxed">{booking.originAddress}</div>
										</div>
									</div>

									{/* Stops (if any) */}
									{booking.stops && booking.stops.length > 0 && (
										<>
											{booking.stops.map((stop: any, index: number) => (
												<div key={stop.id || index} className="flex items-start gap-3">
													<div className="relative mt-1">
														<div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
															<CircleDot className="w-2 h-2 text-white" />
														</div>
														{/* Connector line */}
														<div className="absolute left-1/2 top-4 w-0.5 h-5 bg-gradient-to-b from-blue-400 to-red-400 transform -translate-x-1/2"></div>
													</div>
													<div className="flex-1 min-w-0 pt-0.5">
														<div className="text-xs text-blue-700 font-medium mb-1">STOP {index + 1}</div>
														<div className="font-medium text-gray-900 text-sm break-words leading-relaxed">{stop.address}</div>
													</div>
												</div>
											))}
										</>
									)}

									{/* Destination */}
									<div className="flex items-start gap-3">
										<div className="relative mt-1">
											<div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
												<MapPin className="w-2 h-2 text-white" />
											</div>
										</div>
										<div className="flex-1 min-w-0 pt-0.5">
											<div className="text-xs text-red-700 font-medium mb-1">DROP-OFF LOCATION</div>
											<div className="font-medium text-gray-900 text-sm break-words leading-relaxed">{booking.destinationAddress}</div>
										</div>
									</div>
								</div>

								{/* Journey Summary */}
								<div className="mt-4 pt-3 border-t border-gray-100">
									<div className="flex items-center justify-between text-sm">
										{booking.estimatedDistance && (
											<div className="text-gray-600">
												<span className="font-medium">{formatDistanceKm(booking.estimatedDistance)}</span>
											</div>
										)}
										{booking.estimatedDuration && (
											<div className="text-gray-600">
												<span className="font-medium">{Math.round(booking.estimatedDuration / 60)} min</span>
											</div>
										)}
										{booking.stops && booking.stops.length > 0 && (
											<div className="text-blue-600">
												<span className="font-medium">{booking.stops.length} stop{booking.stops.length > 1 ? 's' : ''}</span>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Schedule */}
							<div className="bg-soft-beige p-4 rounded-lg border overflow-hidden">
								<div className="flex items-center gap-3 mb-3">
									<Calendar className="h-5 w-5 text-primary shrink-0" />
									<h3 className="font-semibold">Schedule</h3>
								</div>
								<div className="space-y-2">
									<div>
										<div className="text-xs text-gray-500 mb-1">PICKUP TIME</div>
										<div className="font-bold text-primary">
											{format(new Date(booking.scheduledPickupTime), "MMM dd, h:mm a")}
										</div>
									</div>
									{booking.actualPickupTime && (
										<div>
											<div className="text-xs text-gray-500 mb-1">ACTUAL PICKUP</div>
											<div className="font-medium">{format(new Date(booking.actualPickupTime), "MMM dd, h:mm a")}</div>
										</div>
									)}
									{booking.actualDropoffTime && (
										<div>
											<div className="text-xs text-gray-500 mb-1">COMPLETED</div>
											<div className="font-medium">{format(new Date(booking.actualDropoffTime), "MMM dd, h:mm a")}</div>
										</div>
									)}
								</div>
							</div>

							{/* Share Links */}
							<div className="bg-soft-beige p-4 rounded-lg border overflow-hidden">
								<div className="flex items-center gap-3 mb-3">
									<Share2 className="h-5 w-5 text-primary shrink-0" />
									<h3 className="font-semibold">Share Links</h3>
								</div>
								{(booking as any).shareToken ? (
									<div className="space-y-3">
										<div className="min-w-0 overflow-hidden">
											<p className="text-xs text-gray-500 mb-1">Client tracking (share with customer)</p>
											<div className="flex gap-2 min-w-0">
												<Input
													readOnly
													value={`${typeof window !== "undefined" ? window.location.origin : ""}/track/${(booking as any).shareToken}`}
													className="text-sm font-mono min-w-0 flex-1 overflow-hidden"
												/>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														navigator.clipboard.writeText(`${window.location.origin}/track/${(booking as any).shareToken}`);
														toast.success("Tracking link copied");
													}}
												>
													<Copy className="h-4 w-4" />
												</Button>
											</div>
										</div>
										<div className="min-w-0 overflow-hidden">
											<p className="text-xs text-gray-500 mb-1">Driver job (share with driver)</p>
											<div className="flex gap-2 min-w-0">
												<Input
													readOnly
													value={`${typeof window !== "undefined" ? window.location.origin : ""}/driver-job/${(booking as any).shareToken}`}
													className="text-sm font-mono min-w-0 flex-1 overflow-hidden"
												/>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														navigator.clipboard.writeText(`${window.location.origin}/driver-job/${(booking as any).shareToken}`);
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
										<p className="text-sm text-muted-foreground mb-2">Generate shareable links for client tracking and driver updates.</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => generateShareTokenMutation.mutate({ bookingId: selectedBookingId! })}
											disabled={generateShareTokenMutation.isPending}
										>
											{generateShareTokenMutation.isPending ? "Generating..." : "Generate Share Links"}
										</Button>
									</div>
								)}
							</div>

							{/* Vehicle & Notes */}
							{(booking.car || booking.specialRequests || (booking as any).additionalNotes) && (
								<div className="space-y-3">
									{booking.car && (
										<div className="bg-soft-beige p-4 rounded-lg border overflow-hidden">
											<div className="flex items-center gap-3 mb-2">
												<Car className="h-5 w-5 text-primary shrink-0" />
												<h3 className="font-semibold">Vehicle</h3>
											</div>
											<div className="font-medium break-words">{booking.car.name}</div>
										</div>
									)}
									{booking.specialRequests && (
										<div className="bg-soft-beige p-4 rounded-lg border overflow-hidden">
											<div className="flex items-center gap-3 mb-2">
												<MessageSquare className="h-5 w-5 text-blue-600 shrink-0" />
												<h3 className="font-semibold">Special Requests</h3>
											</div>
											<div className="bg-blue-50 rounded-lg p-3">
												<div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
													{booking.specialRequests}
												</div>
											</div>
										</div>
									)}
									{(booking as any).additionalNotes && (
										<div className="bg-soft-beige p-4 rounded-lg border overflow-hidden">
											<div className="flex items-center gap-3 mb-2">
												<MessageSquare className="h-5 w-5 text-orange-600 shrink-0" />
												<h3 className="font-semibold">Additional Notes</h3>
											</div>
											<div className="bg-orange-50 rounded-lg p-3">
												<div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
													{(booking as any).additionalNotes}
												</div>
											</div>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Right: Actions & Pricing */}
						<div className="lg:col-span-2 space-y-4 min-w-0 overflow-hidden">
							{/* Actions */}
							<div className="bg-soft-beige p-4 rounded-lg border overflow-hidden">
								<div className="flex items-center gap-3 mb-3">
									<Edit3 className="h-5 w-5 text-primary shrink-0" />
									<h3 className="font-semibold">Actions</h3>
								</div>
								<div className="space-y-3">
									{/* Status Update */}
									<div className="flex gap-3 items-center min-w-0">
										<Select value={selectedStatus} onValueChange={setSelectedStatus}>
											<SelectTrigger className="flex-1 min-w-0">
												<SelectValue placeholder="Update status" />
											</SelectTrigger>
											<SelectContent>
												{statusOptions.map((status) => {
													const Icon = status.icon;
													return (
														<SelectItem key={status.value} value={status.value}>
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
											disabled={!selectedStatus || updateStatusMutation.isPending}
											className="bg-primary hover:bg-primary/90 shrink-0"
										>
											{updateStatusMutation.isPending ? (
												<Timer className="h-4 w-4 animate-spin" />
											) : (
												"Update"
											)}
										</Button>
									</div>

									{/* Car Assignment */}
									<div className="flex gap-3 items-center min-w-0">
										<div className="flex-1 min-w-0 overflow-hidden">
											{booking.car ? (
												<div className="text-sm truncate" title={booking.car.name}>
													<span className="text-gray-500">Car: </span>
													<span className="font-medium">{booking.car.name}</span>
												</div>
											) : (
												<span className="text-sm text-gray-500">No car assigned</span>
											)}
										</div>
										<Button
											onClick={() => setIsAssignCarDialogOpen(true)}
											variant="outline"
											className="border-primary text-primary hover:bg-primary/5 shrink-0"
										>
											<Car className="h-4 w-4 mr-2" />
											{booking.car ? "Change" : "Assign"} Car
										</Button>
									</div>

									{/* Driver Assignment */}
									<div className="flex gap-3 items-center min-w-0">
										<div className="flex-1 min-w-0 overflow-hidden">
											{booking.driverId ? (
												<div className="text-sm truncate" title={booking.driverId}>
													<span className="text-gray-500">Driver: </span>
													<span className="font-medium">{booking.driverId}</span>
												</div>
											) : (
												<span className="text-sm text-gray-500">No driver assigned</span>
											)}
										</div>
										{['confirmed', 'driver_assigned', 'driver_en_route', 'arrived_pickup', 'passenger_on_board', 'in_progress'].includes(booking.status) ? (
											<Button
												onClick={() => setIsAssignDriverDialogOpen(true)}
												variant="outline"
												className="border-primary text-primary hover:bg-primary/5 shrink-0"
											>
												<UserPlus className="h-4 w-4 mr-2" />
												{booking.driverId ? "Reassign" : "Assign"} Driver
											</Button>
										) : (
											<Button
												disabled
												variant="outline"
												className="opacity-50 shrink-0"
											>
												<UserPlus className="h-4 w-4 mr-2 opacity-50" />
												Assign Driver
												<span className="ml-2 text-xs">(Confirm first)</span>
											</Button>
										)}
									</div>
								</div>
							</div>

							{/* Pricing */}
							<div className="bg-soft-beige p-4 rounded-lg border overflow-hidden">
								<div className="flex items-center gap-3 mb-3">
									<CreditCard className="h-5 w-5 text-primary shrink-0" />
									<h3 className="font-semibold">Pricing</h3>
								</div>
								<div className="space-y-2">
									{booking.bookingType === "package" ? (
										<div className="text-sm text-gray-600 mb-2">Package booking - Fixed pricing</div>
									) : (
										<div className="space-y-1 text-sm">
											{booking.baseFare != null && booking.baseFare > 0 && (
												<div className="flex justify-between">
													<span>Base fare:</span>
													<span>${booking.baseFare.toFixed(2)}</span>
												</div>
											)}
											{booking.distanceFare != null && booking.distanceFare > 0 && (
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
										const extras = (booking as { extras?: Array<{ tollCharges?: number; parkingCharges?: number; otherChargesAmount?: number }> })?.extras;
										const tollCharges = extras?.reduce((s, e) => s + (e.tollCharges ?? 0), 0) ?? 0;
										const parkingCharges = extras?.reduce((s, e) => s + (e.parkingCharges ?? 0), 0) ?? 0;
										const otherCharges = extras?.reduce((s, e) => s + (e.otherChargesAmount ?? 0), 0) ?? 0;
										const extraTotal = booking.extraCharges ?? 0;
										const waitingTimeCharge = Math.max(0, extraTotal - tollCharges - parkingCharges - otherCharges);
										const hasBreakdown = tollCharges > 0 || parkingCharges > 0 || waitingTimeCharge > 0 || otherCharges > 0;
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
									<div className="border-t pt-2 mt-2">
										<div className="flex justify-between items-center">
											<span className="font-semibold">Total Amount:</span>
											<span className="text-lg font-bold text-primary">
												${booking.quotedAmount.toFixed(2)}
											</span>
										</div>
										{booking.finalAmount && booking.finalAmount !== booking.quotedAmount && (
											<div className="flex justify-between items-center mt-1">
												<span className="font-semibold">Final Amount:</span>
												<span className="text-lg font-bold text-primary">
													${booking.finalAmount.toFixed(2)}
												</span>
											</div>
										)}
									</div>

									{/* Finalize Amount - for bookings awaiting pricing review */}
									{booking.status === "awaiting_pricing_review" && (
										<div className="mt-4 pt-4 border-t border-amber-200 bg-amber-50/50 rounded-lg p-3 space-y-3">
											<div className="flex items-center gap-2 text-amber-800 font-medium">
												<AlertCircle className="h-4 w-4" />
												<span>Finalize amount & send client summary</span>
											</div>
											{/* Driver's waiting time - from booking extras */}
											{(() => {
												const extras = (booking as { extras?: Array<{ additionalWaitTime?: number | null }> } | undefined)?.extras;
												const totalWaitMins = extras?.reduce((sum, e) => sum + (e.additionalWaitTime ?? 0), 0) ?? 0;
												return totalWaitMins > 0 ? (
													<div className="p-2 rounded bg-amber-100/80 border border-amber-200">
														<div className="text-sm font-medium text-amber-800">Driver added waiting time</div>
														<div className="text-lg font-semibold text-amber-900">{totalWaitMins} minutes</div>
													</div>
												) : null;
											})()}
											<p className="text-sm text-amber-700">
												Tolls and parking (from driver) are automatically included in the total. Add the waiting time charge, then complete to send the summary email to the client.
											</p>
											<div className="grid grid-cols-2 gap-3">
												<div>
													<label className="block text-xs font-medium text-gray-600 mb-1">Waiting time charge ($)</label>
													<Input
														type="number"
														step="0.01"
														min="0"
														placeholder="0.00"
														value={editWaitingTimeCharge}
														onChange={(e) => setEditWaitingTimeCharge(e.target.value)}
													/>
												</div>
												<div>
													<label className="block text-xs font-medium text-gray-600 mb-1">Final Amount ($)</label>
													<Input
														type="number"
														step="0.01"
														placeholder={String(
															Math.round(((booking.quotedAmount ?? 0) + (booking.extraCharges ?? 0) + (Number(editWaitingTimeCharge) || 0)) * 100) / 100
														)}
														value={editFinalAmount}
														onChange={(e) => setEditFinalAmount(e.target.value)}
													/>
												</div>
											</div>
											{(booking.extraCharges != null && booking.extraCharges > 0) && (
												<p className="text-xs text-amber-700">
													Tolls & parking (auto-included): ${booking.extraCharges.toFixed(2)}
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
							<div className="bg-soft-beige p-4 rounded-lg border overflow-hidden">
								<div className="flex items-center gap-3 mb-3">
									<Clock className="h-5 w-5 text-primary shrink-0" />
									<h3 className="font-semibold">Timeline</h3>
								</div>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span>Created:</span>
										<span>{booking.createdAt ? format(new Date(booking.createdAt), "MMM dd, h:mm a") : "N/A"}</span>
									</div>
									{booking.confirmedAt && (
										<div className="flex justify-between">
											<span>Confirmed:</span>
											<span>{format(new Date(booking.confirmedAt), "MMM dd, h:mm a")}</span>
										</div>
									)}
									{booking.serviceStartedAt && (
										<div className="flex justify-between">
											<span>Started:</span>
											<span>{format(new Date(booking.serviceStartedAt), "MMM dd, h:mm a")}</span>
										</div>
									)}
									{booking.serviceCompletedAt && (
										<div className="flex justify-between">
											<span>Completed:</span>
											<span>{format(new Date(booking.serviceCompletedAt), "MMM dd, h:mm a")}</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Footer with Close Button */}
				<div className="flex justify-end p-4 border-t bg-gray-50">
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
