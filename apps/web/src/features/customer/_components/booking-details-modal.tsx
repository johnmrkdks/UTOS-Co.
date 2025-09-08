import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Button } from "@workspace/ui/components/button";
import {
	MapPin,
	Clock,
	User,
	Phone,
	Mail,
	Car,
	Users,
	Calendar as CalendarIcon,
	DollarSign,
	Route,
	Timer,
	AlertCircle,
	CheckCircle,
	Package,
	MessageSquare,
	X,
	Edit3,
	XCircle,
	Loader2,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { format } from "date-fns";
import { Save } from "lucide-react";
import { useEditBookingMutation } from "../_hooks/query/use-edit-booking-mutation";
import { useCancelBookingMutation } from "../_hooks/query/use-cancel-booking-mutation";
import { useGetPublishedCarsQuery } from "../_hooks/query/use-get-published-cars-query";

interface BookingDetailsModalProps {
	booking: any; // TODO: Add proper booking type
	isOpen: boolean;
	onClose: () => void;
}

// Client-side validation function (matches the one in my-bookings.tsx)
function canEditOrCancelBooking(booking: any) {
	if (!booking) return { canEdit: false, canCancel: false, reason: "No booking data" };
	
	const now = new Date();
	const pickupTime = new Date(booking.scheduledPickupTime);
	const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);
	
	if (["completed", "cancelled"].includes(booking.status)) {
		return { 
			canEdit: false, 
			canCancel: false, 
			reason: "Booking is completed or cancelled",
			editReason: "Booking is completed or cancelled",
			cancelReason: "Booking is completed or cancelled"
		};
	}
	
	if (hoursUntilPickup < 4) {
		return { 
			canEdit: false, 
			canCancel: false, 
			reason: "Cannot modify within 4 hours of pickup time",
			editReason: "Cannot modify within 4 hours of pickup time",
			cancelReason: "Cannot modify within 4 hours of pickup time"
		};
	}
	
	const hasDriver = !!booking.driver;
	if (hasDriver) {
		return { 
			canEdit: false, 
			canCancel: true, 
			reason: "Cannot edit after driver assignment",
			editReason: "Cannot edit after driver assignment",
			cancelReason: null
		};
	}
	
	return { 
		canEdit: true, 
		canCancel: true,
		editReason: null,
		cancelReason: null
	};
}

export function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [showCancelConfirm, setShowCancelConfirm] = useState(false);
	const [cancellationReason, setCancellationReason] = useState("");
	const [editData, setEditData] = useState({
		originAddress: booking?.originAddress || "",
		destinationAddress: booking?.destinationAddress || "",
		scheduledPickupTime: booking?.scheduledPickupTime ? new Date(booking.scheduledPickupTime) : new Date(),
		customerName: booking?.customerName || "",
		customerPhone: booking?.customerPhone || "",
		customerEmail: booking?.customerEmail || "",
		passengerCount: booking?.passengerCount || 1,
		specialRequests: booking?.specialRequests || "",
		selectedCarId: booking?.carId || "",
	});

	// Get validation data for edit/cancel permissions using client-side logic
	const validation = canEditOrCancelBooking(booking);
	
	// Mutations
	const editMutation = useEditBookingMutation();
	const cancelMutation = useCancelBookingMutation();
	const { data: publishedCars } = useGetPublishedCarsQuery({ limit: 50 });

	const handleSaveEdit = () => {
		if (!booking?.id) return;
		
		const { selectedCarId, ...bookingData } = editData;
		editMutation.mutate({
			bookingId: booking.id,
			...bookingData,
		});
	};

	const handleCancelBooking = () => {
		if (!booking?.id) return;
		
		cancelMutation.mutate({
			bookingId: booking.id,
			cancellationReason: cancellationReason || undefined,
		});
	};

	// Handle successful edit
	useEffect(() => {
		if (editMutation.isSuccess) {
			setIsEditing(false);
			onClose();
		}
	}, [editMutation.isSuccess, onClose]);

	// Handle successful cancellation
	useEffect(() => {
		if (cancelMutation.isSuccess) {
			setShowCancelConfirm(false);
			setCancellationReason("");
			onClose();
		}
	}, [cancelMutation.isSuccess, onClose]);

	// Update edit data when booking changes
	useEffect(() => {
		if (booking && isOpen) {
			setEditData({
				originAddress: booking.originAddress || "",
				destinationAddress: booking.destinationAddress || "",
				scheduledPickupTime: booking.scheduledPickupTime ? new Date(booking.scheduledPickupTime) : new Date(),
				customerName: booking.customerName || "",
				customerPhone: booking.customerPhone || "",
				customerEmail: booking.customerEmail || "",
				passengerCount: booking.passengerCount || 1,
				specialRequests: booking.specialRequests || "",
				selectedCarId: booking.carId || "",
			});
		}
	}, [booking, isOpen]);

	if (!booking) return null;

	const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(2)}`;

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (date: string | Date) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDuration = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}
		return `${minutes}m`;
	};

	const formatDistance = (meters: number) => {
		const km = meters / 1000;
		return `${km.toFixed(1)} km`;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed": return "bg-green-100 text-green-800 border-green-200";
			case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "driver_assigned": return "bg-blue-100 text-blue-800 border-blue-200";
			case "in_progress": return "bg-purple-100 text-purple-800 border-purple-200";
			case "completed": return "bg-green-100 text-green-800 border-green-200";
			case "cancelled": return "bg-red-100 text-red-800 border-red-200";
			default: return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "confirmed":
			case "completed":
				return <CheckCircle className="h-4 w-4" />;
			case "pending":
				return <Clock className="h-4 w-4" />;
			case "cancelled":
				return <AlertCircle className="h-4 w-4" />;
			case "driver_assigned":
				return <User className="h-4 w-4" />;
			case "in_progress":
				return <Car className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh]">
				<DialogHeader className="flex flex-row items-center justify-between">
					<div>
						<DialogTitle className="flex items-center gap-3">
							<span>Booking Details</span>
							<Badge className={cn("text-xs border", getStatusColor(booking.status))}>
								{getStatusIcon(booking.status)}
								<span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
							</Badge>
						</DialogTitle>
						<DialogDescription>
							Booking ID: {booking.id}
						</DialogDescription>
					</div>
				</DialogHeader>

				<div className="max-h-[70vh] overflow-y-auto pr-4">
					{isEditing ? (
						<div className="space-y-6">
							{/* Edit Form */}
							<div className="space-y-4">
								<h4 className="font-semibold text-lg">Edit Booking</h4>
								
								{/* Route Information */}
								<div className="space-y-4">
									<div className="grid grid-cols-1 gap-4">
										<div>
											<Label htmlFor="originAddress">Pickup Address</Label>
											<Input
												id="originAddress"
												value={editData.originAddress}
												onChange={(e) => setEditData({ ...editData, originAddress: e.target.value })}
												className="mt-1"
											/>
										</div>
										<div>
											<Label htmlFor="destinationAddress">Destination Address</Label>
											<Input
												id="destinationAddress"
												value={editData.destinationAddress}
												onChange={(e) => setEditData({ ...editData, destinationAddress: e.target.value })}
												className="mt-1"
											/>
										</div>
									</div>
								</div>

								{/* Schedule Information */}
								<div className="space-y-4">
									<div>
										<Label>Pickup Date & Time</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
													<CalendarIcon className="mr-2 h-4 w-4" />
													{editData.scheduledPickupTime ? format(editData.scheduledPickupTime, "PPP p") : "Pick a date and time"}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={editData.scheduledPickupTime}
													onSelect={(date) => setEditData({ ...editData, scheduledPickupTime: date || new Date() })}
													initialFocus
												/>
												<div className="p-3 border-t">
													<Input
														type="time"
														value={format(editData.scheduledPickupTime, "HH:mm")}
														onChange={(e) => {
															const [hours, minutes] = e.target.value.split(':');
															const newDate = new Date(editData.scheduledPickupTime);
															newDate.setHours(parseInt(hours), parseInt(minutes));
															setEditData({ ...editData, scheduledPickupTime: newDate });
														}}
													/>
												</div>
											</PopoverContent>
										</Popover>
									</div>
								</div>

								{/* Customer Information */}
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor="customerName">Customer Name</Label>
											<Input
												id="customerName"
												value={editData.customerName}
												onChange={(e) => setEditData({ ...editData, customerName: e.target.value })}
												className="mt-1"
											/>
										</div>
										<div>
											<Label htmlFor="customerPhone">Phone Number</Label>
											<Input
												id="customerPhone"
												value={editData.customerPhone}
												onChange={(e) => setEditData({ ...editData, customerPhone: e.target.value })}
												className="mt-1"
											/>
										</div>
										<div>
											<Label htmlFor="customerEmail">Email Address</Label>
											<Input
												id="customerEmail"
												type="email"
												value={editData.customerEmail}
												onChange={(e) => setEditData({ ...editData, customerEmail: e.target.value })}
												className="mt-1"
											/>
										</div>
										<div>
											<Label htmlFor="passengerCount">Number of Passengers</Label>
											<Select value={editData.passengerCount.toString()} onValueChange={(value) => setEditData({ ...editData, passengerCount: parseInt(value) })}>
												<SelectTrigger className="mt-1">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{[1,2,3,4,5,6,7,8].map(num => (
														<SelectItem key={num} value={num.toString()}>{num} passenger{num > 1 ? 's' : ''}</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>

								{/* Vehicle Selection */}
								{publishedCars?.data && publishedCars.data.length > 0 && (
									<div className="space-y-4">
										<Label>Select Vehicle</Label>
										<Select value={editData.selectedCarId} onValueChange={(value) => setEditData({ ...editData, selectedCarId: value })}>
											<SelectTrigger>
												<SelectValue placeholder="Choose a vehicle" />
											</SelectTrigger>
											<SelectContent>
												{publishedCars.data.map((car: any) => (
													<SelectItem key={car.id} value={car.id}>
														{car.brand?.name} {car.model?.name} - {car.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}

								{/* Special Requests */}
								<div className="space-y-4">
									<div>
										<Label htmlFor="specialRequests">Special Requests</Label>
										<Textarea
											id="specialRequests"
											value={editData.specialRequests}
											onChange={(e) => setEditData({ ...editData, specialRequests: e.target.value })}
											placeholder="Any special requests or notes..."
											className="mt-1 min-h-20"
										/>
									</div>
								</div>

								{/* Edit Actions */}
								<div className="flex gap-2 pt-4 border-t">
									<Button 
										onClick={handleSaveEdit}
										disabled={editMutation.isPending}
										className="flex-1"
									>
										{editMutation.isPending ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
												Saving...
											</>
										) : (
											<>
												<Save className="h-4 w-4 mr-2" />
												Save Changes
											</>
										)}
									</Button>
									<Button 
										variant="outline" 
										onClick={() => setIsEditing(false)}
										disabled={editMutation.isPending}
									>
										<X className="h-4 w-4 mr-2" />
										Cancel
									</Button>
								</div>
							</div>
						</div>
					) : (
						<div className="space-y-6">
						{/* Service Type */}
						<div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
							{booking.bookingType === "package" ? (
								<Package className="h-5 w-5 text-primary" />
							) : (
								<Route className="h-5 w-5 text-primary" />
							)}
							<div>
								<h3 className="font-semibold">
									{booking.bookingType === "package" ? "Premium Service Package" : "Custom Journey"}
								</h3>
								<p className="text-sm text-muted-foreground">
									{booking.bookingType === "package" ? "Pre-configured luxury service" : "Personalized route and service"}
								</p>
							</div>
						</div>

						{/* Route Information */}
						<div className="space-y-4">
							<h4 className="font-semibold flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								Route Details
							</h4>
							<div className="space-y-3">
								<div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
									<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
									<div className="min-w-0">
										<p className="text-sm font-medium text-green-900">Pickup Location</p>
										<p className="text-sm text-green-700">{booking.originAddress}</p>
									</div>
								</div>
								<div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
									<div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
									<div className="min-w-0">
										<p className="text-sm font-medium text-red-900">Destination</p>
										<p className="text-sm text-red-700">{booking.destinationAddress}</p>
									</div>
								</div>
							</div>
						</div>

						{/* Schedule Information */}
						<div className="space-y-4">
							<h4 className="font-semibold flex items-center gap-2">
								<CalendarIcon className="h-4 w-4" />
								Schedule
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground">Pickup Date</p>
									<p className="font-semibold">{formatDate(booking.scheduledPickupTime)}</p>
								</div>
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground">Pickup Time</p>
									<p className="font-semibold">{formatTime(booking.scheduledPickupTime)}</p>
								</div>
								{booking.estimatedDuration && (
									<div className="p-3 bg-muted/50 rounded-lg">
										<p className="text-sm font-medium text-muted-foreground">Estimated Duration</p>
										<p className="font-semibold">{formatDuration(booking.estimatedDuration)}</p>
									</div>
								)}
								{booking.estimatedDistance && (
									<div className="p-3 bg-muted/50 rounded-lg">
										<p className="text-sm font-medium text-muted-foreground">Estimated Distance</p>
										<p className="font-semibold">{formatDistance(booking.estimatedDistance)}</p>
									</div>
								)}
							</div>
						</div>

						{/* Customer Information */}
						<div className="space-y-4">
							<h4 className="font-semibold flex items-center gap-2">
								<User className="h-4 w-4" />
								Customer Information
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground">Customer Name</p>
									<p className="font-semibold">{booking.customerName}</p>
								</div>
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
										<Phone className="h-3 w-3" />
										Phone
									</p>
									<p className="font-semibold">{booking.customerPhone}</p>
								</div>
								{booking.customerEmail && (
									<div className="p-3 bg-muted/50 rounded-lg">
										<p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
											<Mail className="h-3 w-3" />
											Email
										</p>
										<p className="font-semibold">{booking.customerEmail}</p>
									</div>
								)}
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
										<Users className="h-3 w-3" />
										Passengers
									</p>
									<p className="font-semibold">{booking.passengerCount} passenger{booking.passengerCount > 1 ? 's' : ''}</p>
								</div>
							</div>
						</div>

						{/* Pricing Information */}
						<div className="space-y-4">
							<h4 className="font-semibold flex items-center gap-2">
								<DollarSign className="h-4 w-4" />
								Pricing Details
							</h4>
							<div className="space-y-3 p-4 bg-muted/50 rounded-lg">
								<div className="flex justify-between items-center">
									<span className="text-sm">Quoted Amount</span>
									<span className="font-semibold">{formatPrice(booking.quotedAmount)}</span>
								</div>
								{booking.baseFare && (
									<div className="flex justify-between items-center text-sm text-muted-foreground">
										<span>Base Fare</span>
										<span>{formatPrice(booking.baseFare)}</span>
									</div>
								)}
								{booking.distanceFare && (
									<div className="flex justify-between items-center text-sm text-muted-foreground">
										<span>Distance Fare</span>
										<span>{formatPrice(booking.distanceFare)}</span>
									</div>
								)}
								{booking.timeFare && (
									<div className="flex justify-between items-center text-sm text-muted-foreground">
										<span>Time Fare</span>
										<span>{formatPrice(booking.timeFare)}</span>
									</div>
								)}
								{booking.extraCharges > 0 && (
									<div className="flex justify-between items-center text-sm text-muted-foreground">
										<span>Extra Charges</span>
										<span>{formatPrice(booking.extraCharges)}</span>
									</div>
								)}
								{booking.finalAmount && booking.finalAmount !== booking.quotedAmount && (
									<>
										<Separator />
										<div className="flex justify-between items-center font-semibold">
											<span>Final Amount</span>
											<span>{formatPrice(booking.finalAmount)}</span>
										</div>
									</>
								)}
							</div>
						</div>

						{/* Special Requests */}
						{booking.specialRequests && (
							<div className="space-y-4">
								<h4 className="font-semibold flex items-center gap-2">
									<MessageSquare className="h-4 w-4" />
									Special Requests
								</h4>
								<div className="p-4 bg-muted/50 rounded-lg">
									<p className="text-sm">{booking.specialRequests}</p>
								</div>
							</div>
						)}

						{/* Driver Information */}
						{booking.driver && (
							<div className="space-y-4">
								<h4 className="font-semibold flex items-center gap-2">
									<User className="h-4 w-4" />
									Assigned Driver
								</h4>
								<div className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-blue-500">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<p className="text-sm font-medium text-muted-foreground">Driver Name</p>
											<p className="font-semibold">
												{booking.driver.user?.name || "Professional Driver"}
											</p>
										</div>
										<div className="space-y-2">
											<p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
												<Phone className="h-3 w-3" />
												Contact Number
											</p>
											<p className="font-semibold">
												{booking.driver.phoneNumber || booking.driver.user?.phone || "Available on request"}
											</p>
										</div>
										{booking.driver.rating && (
											<div className="space-y-2">
												<p className="text-sm font-medium text-muted-foreground">Rating</p>
												<div className="flex items-center gap-1">
													<span className="font-semibold">{booking.driver.rating.toFixed(1)}</span>
													<span className="text-yellow-500">★</span>
													<span className="text-sm text-muted-foreground">
														({booking.driver.totalRides || 0} rides)
													</span>
												</div>
											</div>
										)}
										{booking.driverAssignedAt && (
											<div className="space-y-2">
												<p className="text-sm font-medium text-muted-foreground">Assigned</p>
												<p className="text-sm">
													{formatDate(booking.driverAssignedAt)} at {formatTime(booking.driverAssignedAt)}
												</p>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Timeline */}
						<div className="space-y-4">
							<h4 className="font-semibold flex items-center gap-2">
								<Timer className="h-4 w-4" />
								Booking Timeline
							</h4>
							<div className="space-y-3">
								<div className="flex items-center gap-3 text-sm">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									<span className="text-muted-foreground">Created:</span>
									<span>{formatDate(booking.createdAt)} at {formatTime(booking.createdAt)}</span>
								</div>
								{booking.confirmedAt && (
									<div className="flex items-center gap-3 text-sm">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										<span className="text-muted-foreground">Confirmed:</span>
										<span>{formatDate(booking.confirmedAt)} at {formatTime(booking.confirmedAt)}</span>
									</div>
								)}
								{booking.driverAssignedAt && (
									<div className="flex items-center gap-3 text-sm">
										<div className="w-2 h-2 bg-purple-500 rounded-full"></div>
										<span className="text-muted-foreground">Driver Assigned:</span>
										<span>{formatDate(booking.driverAssignedAt)} at {formatTime(booking.driverAssignedAt)}</span>
									</div>
								)}
								{booking.serviceStartedAt && (
									<div className="flex items-center gap-3 text-sm">
										<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
										<span className="text-muted-foreground">Service Started:</span>
										<span>{formatDate(booking.serviceStartedAt)} at {formatTime(booking.serviceStartedAt)}</span>
									</div>
								)}
								{booking.serviceCompletedAt && (
									<div className="flex items-center gap-3 text-sm">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										<span className="text-muted-foreground">Service Completed:</span>
										<span>{formatDate(booking.serviceCompletedAt)} at {formatTime(booking.serviceCompletedAt)}</span>
									</div>
								)}
							</div>
						</div>
					</div>
					)}
				</div>

				{/* Action Buttons */}
				<div className="pt-4 border-t space-y-4">
					{/* Edit/Cancel buttons */}
					<div className="flex gap-2">
						{validation?.canEdit && (
							<Button 
								variant="outline" 
								size="sm"
								onClick={() => setIsEditing(true)}
							>
								<Edit3 className="h-4 w-4 mr-2" />
								Edit Booking
							</Button>
						)}
						
						{validation?.canCancel && !showCancelConfirm && (
							<Button 
								variant="outline" 
								size="sm"
								onClick={() => setShowCancelConfirm(true)}
								className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
							>
								<XCircle className="h-4 w-4 mr-2" />
								Cancel Booking
							</Button>
						)}
					</div>

					{/* Cancellation reasons */}
					{!validation?.canEdit && validation?.editReason && (
						<div className="text-xs text-muted-foreground">
							Edit unavailable: {validation.editReason}
						</div>
					)}
					{!validation?.canCancel && validation?.cancelReason && (
						<div className="text-xs text-muted-foreground">
							Cancel unavailable: {validation.cancelReason}
						</div>
					)}

					{/* Cancel confirmation section */}
					{showCancelConfirm && (
						<div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
							<div className="flex items-center gap-2 text-red-800">
								<AlertCircle className="h-4 w-4" />
								<span className="font-medium">Confirm Booking Cancellation</span>
							</div>
							<div className="space-y-3">
								<Input
									placeholder="Cancellation reason (optional)"
									value={cancellationReason}
									onChange={(e) => setCancellationReason(e.target.value)}
									className="border-red-200 focus:border-red-300 focus:ring-red-200"
								/>
								<div className="flex gap-2">
									<Button 
										size="sm"
										variant="destructive"
										disabled={cancelMutation.isPending}
										onClick={handleCancelBooking}
									>
										{cancelMutation.isPending ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
												Cancelling...
											</>
										) : (
											<>
												<XCircle className="h-4 w-4 mr-2" />
												Confirm Cancellation
											</>
										)}
									</Button>
									<Button 
										size="sm"
										variant="outline" 
										onClick={() => {
											setShowCancelConfirm(false);
											setCancellationReason("");
										}}
									>
										Keep Booking
									</Button>
								</div>
							</div>
						</div>
					)}
					
					{/* Close button */}
					<div className="flex justify-end">
						<Button variant="outline" onClick={onClose}>
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}