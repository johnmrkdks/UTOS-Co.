import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import {
	ArrowLeft,
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
	CheckCircle,
	AlertCircle,
	Package,
	MessageSquare,
	Edit3,
	XCircle,
	Loader2,
	Save,
	X,
	Trash2,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { useEditBookingMutation } from "../_hooks/query/use-edit-booking-mutation";
import { useCancelBookingMutation } from "../_hooks/query/use-cancel-booking-mutation";
import { useGetPublishedCarsQuery } from "../_hooks/query/use-get-published-cars-query";

interface BookingDetailsPageProps {
	booking: any;
	onClose: () => void;
}

// Client-side validation function
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

export function BookingDetailsPage({ booking, onClose }: BookingDetailsPageProps) {
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

	const validation = canEditOrCancelBooking(booking);
	const editMutation = useEditBookingMutation();
	const cancelMutation = useCancelBookingMutation();
	const { data: publishedCars } = useGetPublishedCarsQuery({ limit: 50 });

	const handleSaveEdit = () => {
		if (!booking?.id) return;
		
		const { selectedCarId, scheduledPickupTime, ...bookingData } = editData;
		editMutation.mutate({
			bookingId: booking.id,
			scheduledPickupTime: scheduledPickupTime.toISOString(),
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

	// Cancellation confirmation view
	if (showCancelConfirm) {
		return (
			<div className="min-h-screen bg-background">
				{/* Mobile Header */}
				<div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
					<div className="flex items-center justify-between">
						<Button 
							variant="ghost" 
							size="sm" 
							onClick={() => setShowCancelConfirm(false)}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Button>
						<h1 className="font-semibold">Cancel Booking</h1>
						<div className="w-12" />
					</div>
				</div>

				<div className="p-4 space-y-6">
					<Card className="border-red-200 bg-red-50">
						<CardHeader>
							<CardTitle className="text-red-900 flex items-center gap-2">
								<XCircle className="h-5 w-5" />
								Cancel Booking Confirmation
							</CardTitle>
							<CardDescription className="text-red-700">
								This action cannot be undone. Your booking will be permanently cancelled.
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Booking Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Booking ID:</span>
								<span className="font-medium">{booking.id.slice(0, 8)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Route:</span>
								<span className="font-medium text-right">
									{booking.originAddress} → {booking.destinationAddress}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Pickup:</span>
								<span className="font-medium">
									{formatDate(booking.scheduledPickupTime)} at {formatTime(booking.scheduledPickupTime)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Amount:</span>
								<span className="font-medium">{formatPrice(booking.quotedAmount)}</span>
							</div>
						</CardContent>
					</Card>

					<div className="space-y-4">
						<Label htmlFor="cancellation-reason">Reason for cancellation (optional)</Label>
						<Textarea
							id="cancellation-reason"
							placeholder="Please let us know why you're cancelling..."
							value={cancellationReason}
							onChange={(e) => setCancellationReason(e.target.value)}
							className="min-h-[100px]"
						/>
					</div>

					<div className="flex flex-col gap-3 pt-4">
						<Button 
							variant="destructive" 
							size="lg" 
							className="w-full"
							disabled={cancelMutation.isPending}
							onClick={handleCancelBooking}
						>
							{cancelMutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<XCircle className="h-4 w-4 mr-2" />
							)}
							Confirm Cancellation
						</Button>
						<Button 
							variant="outline" 
							size="lg" 
							className="w-full"
							onClick={() => setShowCancelConfirm(false)}
						>
							Keep Booking
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-50 bg-background flex flex-col">
			{/* Mobile Header */}
			<div className="flex-shrink-0 bg-background border-b px-4 py-3">
				<div className="flex items-center justify-between">
					<Button variant="ghost" size="sm" onClick={onClose}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div className="flex items-center gap-2">
						<h1 className="font-semibold">Booking Details</h1>
						<Badge className={cn("text-xs border", getStatusColor(booking.status))}>
							{getStatusIcon(booking.status)}
							<span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
						</Badge>
					</div>
					<div className="w-12" />
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
				{/* Service Type */}
				<Card>
					<CardContent className="pt-4">
						<div className="flex items-center gap-3">
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
					</CardContent>
				</Card>

				{/* Route Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="h-4 w-4" />
							Route Details
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{isEditing ? (
							<div className="space-y-4">
								<div className="space-y-2">
									<Label>Pickup Location</Label>
									<Input
										value={editData.originAddress}
										onChange={(e) => setEditData(prev => ({ ...prev, originAddress: e.target.value }))}
										placeholder="Enter pickup address..."
									/>
								</div>
								<div className="space-y-2">
									<Label>Destination</Label>
									<Input
										value={editData.destinationAddress}
										onChange={(e) => setEditData(prev => ({ ...prev, destinationAddress: e.target.value }))}
										placeholder="Enter destination address..."
									/>
								</div>
							</div>
						) : (
							<>
								<div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
									<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-green-900">Pickup Location</p>
										<p className="text-sm text-green-700 break-words">{booking.originAddress}</p>
									</div>
								</div>
								<div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
									<div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-red-900">Destination</p>
										<p className="text-sm text-red-700 break-words">{booking.destinationAddress}</p>
									</div>
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Schedule Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarIcon className="h-4 w-4" />
							Schedule
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{isEditing ? (
							<div className="space-y-4">
								<div className="space-y-2">
									<Label>Pickup Date & Time</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button variant="outline" className="w-full justify-start text-left font-normal">
												<CalendarIcon className="mr-2 h-4 w-4" />
												{format(editData.scheduledPickupTime, "PPP 'at' p")}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={editData.scheduledPickupTime}
												onSelect={(date) => date && setEditData(prev => ({ 
													...prev, 
													scheduledPickupTime: date 
												}))}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-3">
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground">Pickup Date</p>
									<p className="font-semibold">{formatDate(booking.scheduledPickupTime)}</p>
								</div>
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground">Pickup Time</p>
									<p className="font-semibold">{formatTime(booking.scheduledPickupTime)}</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Customer Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-4 w-4" />
							Customer Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{isEditing ? (
							<div className="space-y-4">
								<div className="grid grid-cols-1 gap-4">
									<div className="space-y-2">
										<Label>Customer Name</Label>
										<Input
											value={editData.customerName}
											onChange={(e) => setEditData(prev => ({ ...prev, customerName: e.target.value }))}
											placeholder="Enter name..."
										/>
									</div>
									<div className="space-y-2">
										<Label>Phone Number</Label>
										<Input
											value={editData.customerPhone}
											onChange={(e) => setEditData(prev => ({ ...prev, customerPhone: e.target.value }))}
											placeholder="Enter phone number..."
										/>
									</div>
									<div className="space-y-2">
										<Label>Email (Optional)</Label>
										<Input
											value={editData.customerEmail}
											onChange={(e) => setEditData(prev => ({ ...prev, customerEmail: e.target.value }))}
											placeholder="Enter email..."
										/>
									</div>
									<div className="space-y-2">
										<Label>Number of Passengers</Label>
										<Select
											value={editData.passengerCount.toString()}
											onValueChange={(value) => setEditData(prev => ({ 
												...prev, 
												passengerCount: parseInt(value) 
											}))}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
													<SelectItem key={num} value={num.toString()}>
														{num} {num === 1 ? 'passenger' : 'passengers'}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-3">
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
						)}
					</CardContent>
				</Card>

				{/* Car Selection (only show in edit mode) */}
				{isEditing && publishedCars?.data && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Car className="h-4 w-4" />
								Vehicle Selection
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Label>Select Vehicle</Label>
								<Select
									value={editData.selectedCarId}
									onValueChange={(value) => setEditData(prev => ({ 
										...prev, 
										selectedCarId: value 
									}))}
								>
									<SelectTrigger>
										<SelectValue placeholder="Choose a vehicle..." />
									</SelectTrigger>
									<SelectContent>
										{publishedCars.data.map((car: any) => (
											<SelectItem key={car.id} value={car.id}>
												{car.brand?.name} {car.model?.name} - {car.category?.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Special Requests */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MessageSquare className="h-4 w-4" />
							Special Requests
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isEditing ? (
							<div className="space-y-2">
								<Label>Special Requirements or Notes</Label>
								<Textarea
									value={editData.specialRequests}
									onChange={(e) => setEditData(prev => ({ ...prev, specialRequests: e.target.value }))}
									placeholder="Any special requirements or notes..."
									className="min-h-[80px]"
								/>
							</div>
						) : (
							<div>
								{booking.specialRequests ? (
									<p className="text-sm">{booking.specialRequests}</p>
								) : (
									<p className="text-sm text-muted-foreground italic">No special requests</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Pricing Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="h-4 w-4" />
							Pricing Details
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 p-4 bg-muted/50 rounded-lg">
							<div className="flex justify-between items-center">
								<span className="text-sm">Quoted Amount</span>
								<span className="font-semibold">{formatPrice(booking.quotedAmount)}</span>
							</div>
							{booking.finalAmount && booking.finalAmount !== booking.quotedAmount && (
								<>
									<div className="border-t pt-3">
										<div className="flex justify-between items-center font-semibold">
											<span>Final Amount</span>
											<span>{formatPrice(booking.finalAmount)}</span>
										</div>
									</div>
								</>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Driver Information */}
				{booking.driver && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-4 w-4" />
								Assigned Driver
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-blue-500 space-y-3">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Driver Name</p>
									<p className="font-semibold">
										{booking.driver.user?.name || "Professional Driver"}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
										<Phone className="h-3 w-3" />
										Contact Number
									</p>
									<p className="font-semibold">
										{booking.driver.phoneNumber || booking.driver.user?.phone || "Available on request"}
									</p>
								</div>
								{booking.driver.rating && (
									<div>
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
							</div>
						</CardContent>
					</Card>
				)}

				{/* Error Messages for Non-editable Bookings */}
				{!validation.canEdit && validation.editReason && !isEditing && (
					<Card className="border-amber-200 bg-amber-50">
						<CardContent className="pt-4">
							<div className="flex items-start gap-2 text-amber-800">
								<AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
								<p className="text-sm">
									<strong>Editing not available:</strong> {validation.editReason}
								</p>
							</div>
						</CardContent>
					</Card>
				)}

				{!validation.canCancel && validation.cancelReason && (
					<Card className="border-red-200 bg-red-50">
						<CardContent className="pt-4">
							<div className="flex items-start gap-2 text-red-800">
								<XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
								<p className="text-sm">
									<strong>Cancellation not available:</strong> {validation.cancelReason}
								</p>
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Sticky Bottom Actions */}
			<div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
				{isEditing ? (
					<div className="flex gap-3">
						<Button 
							variant="outline" 
							size="lg" 
							className="flex-1"
							onClick={() => setIsEditing(false)}
							disabled={editMutation.isPending}
						>
							<X className="h-4 w-4 mr-2" />
							Cancel
						</Button>
						<Button 
							size="lg" 
							className="flex-1"
							onClick={handleSaveEdit}
							disabled={editMutation.isPending}
						>
							{editMutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							Save Changes
						</Button>
					</div>
				) : (
					<div className="flex gap-3">
						{validation.canCancel && (
							<Button 
								variant="outline" 
								size="lg" 
								className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
								onClick={() => setShowCancelConfirm(true)}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Cancel Booking
							</Button>
						)}
						{validation.canEdit && (
							<Button 
								size="lg" 
								className="flex-1"
								onClick={() => setIsEditing(true)}
							>
								<Edit3 className="h-4 w-4 mr-2" />
								Edit Booking
							</Button>
						)}
						{!validation.canEdit && !validation.canCancel && (
							<Button 
								size="lg" 
								className="w-full"
								onClick={onClose}
							>
								Close
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}