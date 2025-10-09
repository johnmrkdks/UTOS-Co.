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
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Progress } from "@workspace/ui/components/progress";
import { useGetBookingByIdQuery } from "../_hooks/query/use-get-booking-by-id-query";
import { useUpdateBookingStatusMutation } from "../_hooks/query/use-update-booking-status-mutation";
import { useAssignDriverMutation } from "../_hooks/query/use-assign-driver-mutation";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import { AssignDriverDialog } from "./assign-driver-dialog";
import { AssignCarDialog } from "./assign-car-dialog";
import { format } from "date-fns";
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
	MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const statusOptions = [
	{ value: "pending", label: "Pending", color: "warning", icon: Timer, description: "Awaiting confirmation" },
	{ value: "confirmed", label: "Confirmed", color: "success", icon: CheckCircle, description: "Booking confirmed" },
	{ value: "driver_assigned", label: "Driver Assigned", color: "info", icon: UserPlus, description: "Driver ready" },
	{ value: "in_progress", label: "In Progress", color: "primary", icon: Navigation, description: "Service active" },
	{ value: "completed", label: "Completed", color: "success", icon: CheckCircle, description: "Service complete" },
	{ value: "cancelled", label: "Cancelled", color: "destructive", icon: X, description: "Booking cancelled" },
];

const getStatusProgress = (status: string): number => {
	switch (status) {
		case "pending": return 20;
		case "confirmed": return 40;
		case "driver_assigned": return 60;
		case "in_progress": return 80;
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

	const bookingQuery = useGetBookingByIdQuery(
		{ id: selectedBookingId! },
		!!selectedBookingId
	);

	const updateStatusMutation = useUpdateBookingStatusMutation();
	const assignDriverMutation = useAssignDriverMutation();

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

	if (!booking) return null;

	const currentStatus = statusOptions.find(s => s.value === booking.status);
	const StatusIcon = currentStatus?.icon || Timer;

	return (
		<>
			<Dialog open={isBookingDetailsDialogOpen} onOpenChange={closeBookingDetailsDialog}>
			<DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-hidden p-0">
				{/* Simple Header */}
				<div className="flex items-center justify-between p-4 border-b bg-soft-beige">
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<h2 className="text-xl font-semibold">Booking Details</h2>
						<Badge variant="outline" className="text-xs">
							{booking.bookingType === "package" ? "Package" : "Custom"}
						</Badge>
						<Badge variant={currentStatus?.color as any || "secondary"} className="text-xs">
							{booking.status.replace("_", " ").toUpperCase()}
						</Badge>
					</div>
					<div className="text-right flex-shrink-0 ml-4">
						<div className="text-lg font-bold text-primary">
							${booking.quotedAmount.toFixed(2)}
						</div>
						<div className="text-xs text-gray-500 font-mono">#{(booking as any).referenceNumber || 'N/A'}</div>
					</div>
				</div>

				{/* Content in simple grid layout */}
				<div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						
						{/* Left: Customer & Route Info */}
						<div className="lg:col-span-2 space-y-4">
							{/* Customer */}
							<div className="bg-soft-beige p-4 rounded-lg border">
								<div className="flex items-center gap-3 mb-3">
									<User className="h-5 w-5 text-primary" />
									<h3 className="font-semibold">Customer</h3>
								</div>
								<div className="space-y-2">
									<div className="font-bold text-lg">{booking.customerName}</div>
									<div className="text-sm text-gray-600">{booking.passengerCount} passenger{booking.passengerCount > 1 ? 's' : ''}</div>
									<div className="flex gap-4 text-sm">
										<a href={`tel:${booking.customerPhone}`} className="text-primary hover:underline">{booking.customerPhone}</a>
										{booking.customerEmail && (
											<a href={`mailto:${booking.customerEmail}`} className="text-primary hover:underline">{booking.customerEmail}</a>
										)}
									</div>
								</div>
							</div>

							{/* Route */}
							<div className="bg-soft-beige p-4 rounded-lg border">
								<div className="flex items-center gap-3 mb-3">
									<Navigation className="h-5 w-5 text-primary" />
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
												<span className="font-medium">{(booking.estimatedDistance / 1000).toFixed(1)} km</span>
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
							<div className="bg-soft-beige p-4 rounded-lg border">
								<div className="flex items-center gap-3 mb-3">
									<Calendar className="h-5 w-5 text-primary" />
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

							{/* Vehicle & Notes */}
							{(booking.car || booking.specialRequests || (booking as any).additionalNotes) && (
								<div className="space-y-3">
									{booking.car && (
										<div className="bg-soft-beige p-4 rounded-lg border">
											<div className="flex items-center gap-3 mb-2">
												<Car className="h-5 w-5 text-primary" />
												<h3 className="font-semibold">Vehicle</h3>
											</div>
											<div className="font-medium">{booking.car.name}</div>
										</div>
									)}
									{booking.specialRequests && (
										<div className="bg-soft-beige p-4 rounded-lg border">
											<div className="flex items-center gap-3 mb-2">
												<MessageSquare className="h-5 w-5 text-blue-600" />
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
										<div className="bg-soft-beige p-4 rounded-lg border">
											<div className="flex items-center gap-3 mb-2">
												<MessageSquare className="h-5 w-5 text-orange-600" />
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
						<div className="lg:col-span-2 space-y-4">
							{/* Actions */}
							<div className="bg-soft-beige p-4 rounded-lg border">
								<div className="flex items-center gap-3 mb-3">
									<Edit3 className="h-5 w-5 text-primary" />
									<h3 className="font-semibold">Actions</h3>
								</div>
								<div className="space-y-3">
									{/* Status Update */}
									<div className="flex gap-3 items-center">
										<Select value={selectedStatus} onValueChange={setSelectedStatus}>
											<SelectTrigger className="flex-1">
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
											className="bg-primary hover:bg-primary/90"
										>
											{updateStatusMutation.isPending ? (
												<Timer className="h-4 w-4 animate-spin" />
											) : (
												"Update"
											)}
										</Button>
									</div>

									{/* Car Assignment */}
									<div className="flex gap-3 items-center">
										<div className="flex-1">
											{booking.car ? (
												<div className="text-sm">
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
											className="border-primary text-primary hover:bg-primary/5"
										>
											<Car className="h-4 w-4 mr-2" />
											{booking.car ? "Change" : "Assign"} Car
										</Button>
									</div>

									{/* Driver Assignment */}
									<div className="flex gap-3 items-center">
										<div className="flex-1">
											{booking.driverId ? (
												<div className="text-sm">
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
												className="border-primary text-primary hover:bg-primary/5"
											>
												<UserPlus className="h-4 w-4 mr-2" />
												{booking.driverId ? "Reassign" : "Assign"} Driver
											</Button>
										) : (
											<Button
												disabled
												variant="outline"
												className="opacity-50"
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
							<div className="bg-soft-beige p-4 rounded-lg border">
								<div className="flex items-center gap-3 mb-3">
									<CreditCard className="h-5 w-5 text-primary" />
									<h3 className="font-semibold">Pricing</h3>
								</div>
								<div className="space-y-2">
									{booking.bookingType === "package" ? (
										<div className="text-sm text-gray-600 mb-2">Package booking - Fixed pricing</div>
									) : (
										<div className="space-y-1 text-sm">
											{booking.baseFare && (
												<div className="flex justify-between">
													<span>Base fare:</span>
													<span>${booking.baseFare.toFixed(2)}</span>
												</div>
											)}
											{booking.distanceFare && (
												<div className="flex justify-between">
													<span>Distance:</span>
													<span>${booking.distanceFare.toFixed(2)}</span>
												</div>
											)}
											{booking.timeFare && (
												<div className="flex justify-between">
													<span>Time:</span>
													<span>${booking.timeFare.toFixed(2)}</span>
												</div>
											)}
											{booking.extraCharges && booking.extraCharges > 0 && (
												<div className="flex justify-between">
													<span>Extra charges:</span>
													<span>${booking.extraCharges.toFixed(2)}</span>
												</div>
											)}
										</div>
									)}
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
								</div>
							</div>

							{/* Timeline */}
							<div className="bg-soft-beige p-4 rounded-lg border">
								<div className="flex items-center gap-3 mb-3">
									<Clock className="h-5 w-5 text-primary" />
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
