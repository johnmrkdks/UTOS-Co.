import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetBookingByIdQuery } from "../_hooks/query/use-get-booking-by-id-query";
import { useUpdateBookingStatusMutation } from "../_hooks/query/use-update-booking-status-mutation";
import { useAssignDriverMutation } from "../_hooks/query/use-assign-driver-mutation";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
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
	Users
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const statusOptions = [
	{ value: "pending", label: "Pending", color: "warning" },
	{ value: "confirmed", label: "Confirmed", color: "success" },
	{ value: "driver_assigned", label: "Driver Assigned", color: "info" },
	{ value: "in_progress", label: "In Progress", color: "primary" },
	{ value: "completed", label: "Completed", color: "success" },
	{ value: "cancelled", label: "Cancelled", color: "destructive" },
];

export function BookingDetailsDialog() {
	const { 
		isBookingDetailsDialogOpen, 
		closeBookingDetailsDialog,
		selectedBookingId 
	} = useBookingManagementModalProvider();
	
	const [selectedStatus, setSelectedStatus] = useState<string>("");

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
	
	if (!booking) return null;

	return (
		<Dialog open={isBookingDetailsDialogOpen} onOpenChange={closeBookingDetailsDialog}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Booking Details
						<Badge variant={booking.bookingType === "package" ? "default" : "secondary"}>
							{booking.bookingType === "package" ? "Package" : "Custom"}
						</Badge>
					</DialogTitle>
					<DialogDescription>
						Booking ID: {booking.id}
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main booking details */}
					<div className="lg:col-span-2 space-y-6">
						{/* Customer Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									Customer Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">{booking.customerName}</span>
								</div>
								<div className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<span>{booking.customerPhone}</span>
								</div>
								{booking.customerEmail && (
									<div className="flex items-center gap-2">
										<Mail className="h-4 w-4 text-muted-foreground" />
										<span>{booking.customerEmail}</span>
									</div>
								)}
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4 text-muted-foreground" />
									<span>{booking.passengerCount} passenger{booking.passengerCount > 1 ? 's' : ''}</span>
								</div>
							</CardContent>
						</Card>

						{/* Route Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MapPin className="h-5 w-5" />
									Route Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<div className="text-sm font-medium text-muted-foreground mb-1">Pickup Location</div>
									<div className="flex items-start gap-2">
										<MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
										<span>{booking.originAddress}</span>
									</div>
								</div>
								<div>
									<div className="text-sm font-medium text-muted-foreground mb-1">Destination</div>
									<div className="flex items-start gap-2">
										<MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
										<span>{booking.destinationAddress}</span>
									</div>
								</div>
								{booking.estimatedDistance && (
									<div className="grid grid-cols-2 gap-4 pt-2">
										<div className="text-sm">
											<span className="text-muted-foreground">Distance:</span>{" "}
											<span className="font-medium">{(booking.estimatedDistance / 1000).toFixed(1)} km</span>
										</div>
										{booking.estimatedDuration && (
											<div className="text-sm">
												<span className="text-muted-foreground">Duration:</span>{" "}
												<span className="font-medium">{Math.round(booking.estimatedDuration / 60)} min</span>
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Schedule Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Schedule
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<div>
										<div className="font-medium">Scheduled Pickup</div>
										<div className="text-sm text-muted-foreground">
											{format(new Date(booking.scheduledPickupTime), "PPP 'at' p")}
										</div>
									</div>
								</div>
								{booking.actualPickupTime && (
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-green-600" />
										<div>
											<div className="font-medium">Actual Pickup</div>
											<div className="text-sm text-muted-foreground">
												{format(new Date(booking.actualPickupTime), "PPP 'at' p")}
											</div>
										</div>
									</div>
								)}
								{booking.actualDropoffTime && (
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-blue-600" />
										<div>
											<div className="font-medium">Completed</div>
											<div className="text-sm text-muted-foreground">
												{format(new Date(booking.actualDropoffTime), "PPP 'at' p")}
											</div>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Vehicle Information */}
						{booking.car && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Car className="h-5 w-5" />
										Vehicle
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-2">
										<Car className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">{booking.car.name}</span>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Special Requests */}
						{booking.specialRequests && (
							<Card>
								<CardHeader>
									<CardTitle>Special Requests</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm">{booking.specialRequests}</p>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Status and pricing sidebar */}
					<div className="lg:col-span-1 space-y-6">
						{/* Status Management */}
						<Card>
							<CardHeader>
								<CardTitle>Booking Status</CardTitle>
								<CardDescription>
									Update booking status and assign drivers
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">Current Status:</span>
									<Badge variant={
										statusOptions.find(s => s.value === booking.status)?.color as any || "secondary"
									}>
										{booking.status.replace("_", " ").toUpperCase()}
									</Badge>
								</div>

								<Separator />

								<div className="space-y-2">
									<label className="text-sm font-medium">Update Status</label>
									<Select value={selectedStatus} onValueChange={setSelectedStatus}>
										<SelectTrigger>
											<SelectValue placeholder="Select new status" />
										</SelectTrigger>
										<SelectContent>
											{statusOptions.map((status) => (
												<SelectItem key={status.value} value={status.value}>
													{status.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										size="sm"
										className="w-full"
										onClick={() => handleStatusUpdate(selectedStatus)}
										disabled={!selectedStatus || updateStatusMutation.isPending}
									>
										{updateStatusMutation.isPending ? "Updating..." : "Update Status"}
									</Button>
								</div>

								{booking.driverId && (
									<div className="pt-2">
										<div className="text-sm font-medium mb-1">Assigned Driver</div>
										<div className="text-sm text-muted-foreground">Driver ID: {booking.driverId}</div>
										{booking.driverAssignedAt && (
											<div className="text-xs text-muted-foreground">
												Assigned: {format(new Date(booking.driverAssignedAt), "MMM dd, HH:mm")}
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Pricing Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<DollarSign className="h-5 w-5" />
									Pricing
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{booking.bookingType === "package" ? (
									<div className="flex items-center gap-2">
										<Package className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">Package Price</span>
									</div>
								) : (
									<div className="space-y-2 text-sm">
										{booking.baseFare && (
											<div className="flex justify-between">
												<span>Base fare</span>
												<span>${(booking.baseFare / 100).toFixed(2)}</span>
											</div>
										)}
										{booking.distanceFare && (
											<div className="flex justify-between">
												<span>Distance fare</span>
												<span>${(booking.distanceFare / 100).toFixed(2)}</span>
											</div>
										)}
										{booking.timeFare && (
											<div className="flex justify-between">
												<span>Time fare</span>
												<span>${(booking.timeFare / 100).toFixed(2)}</span>
											</div>
										)}
										{booking.extraCharges && booking.extraCharges > 0 && (
											<div className="flex justify-between">
												<span>Extra charges</span>
												<span>${(booking.extraCharges / 100).toFixed(2)}</span>
											</div>
										)}
										<Separator />
									</div>
								)}
								
								<div className="flex justify-between font-medium">
									<span>Quoted Amount</span>
									<span>${(booking.quotedAmount / 100).toFixed(2)}</span>
								</div>
								
								{booking.finalAmount && booking.finalAmount !== booking.quotedAmount && (
									<div className="flex justify-between font-medium text-green-600">
										<span>Final Amount</span>
										<span>${(booking.finalAmount / 100).toFixed(2)}</span>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Booking Timeline */}
						<Card>
							<CardHeader>
								<CardTitle>Timeline</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span>Created</span>
									<span>{format(new Date(booking.createdAt), "MMM dd, HH:mm")}</span>
								</div>
								{booking.confirmedAt && (
									<div className="flex justify-between">
										<span>Confirmed</span>
										<span>{format(new Date(booking.confirmedAt), "MMM dd, HH:mm")}</span>
									</div>
								)}
								{booking.serviceStartedAt && (
									<div className="flex justify-between">
										<span>Started</span>
										<span>{format(new Date(booking.serviceStartedAt), "MMM dd, HH:mm")}</span>
									</div>
								)}
								{booking.serviceCompletedAt && (
									<div className="flex justify-between">
										<span>Completed</span>
										<span>{format(new Date(booking.serviceCompletedAt), "MMM dd, HH:mm")}</span>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}