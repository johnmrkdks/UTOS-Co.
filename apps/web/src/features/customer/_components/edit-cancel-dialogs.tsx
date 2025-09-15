import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { DateTimePicker } from "@/components/date-time-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
	AlertTriangle,
	Edit3,
	Loader2,
	Save,
	X,
	XCircle,
} from "lucide-react";
import { useEditBookingMutation } from "../_hooks/query/use-edit-booking-mutation";
import { useCancelBookingMutation } from "../_hooks/query/use-cancel-booking-mutation";

interface EditCancelDialogsProps {
	booking: any;
	isEditOpen: boolean;
	isCancelOpen: boolean;
	onEditOpenChange: (open: boolean) => void;
	onCancelOpenChange: (open: boolean) => void;
}

export function EditCancelDialogs({
	booking,
	isEditOpen,
	isCancelOpen,
	onEditOpenChange,
	onCancelOpenChange,
}: EditCancelDialogsProps) {
	const [cancellationReason, setCancellationReason] = useState("");
	const [date, setDate] = useState<Date>();
	const [editData, setEditData] = useState({
		scheduledPickupDate: "",
		scheduledPickupTime: "",
		customerName: booking?.customerName || "",
		customerPhone: booking?.customerPhone || "",
		customerEmail: booking?.customerEmail || "",
		passengerCount: booking?.passengerCount || 1,
		luggageCount: booking?.luggageCount || 0,
		specialRequests: booking?.specialRequests || "",
	});

	// Update form data when booking changes
	useEffect(() => {
		if (booking) {
			// Parse the scheduled pickup time to get date and time
			const scheduledPickupTime = booking?.scheduledPickupTime ? new Date(booking.scheduledPickupTime) : new Date();

			// Extract date for the date picker
			setDate(scheduledPickupTime);

			// Extract time in HH:MM format
			const timeString = scheduledPickupTime.toLocaleTimeString('en-GB', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			});

			// Extract date string in YYYY-MM-DD format
			const year = scheduledPickupTime.getFullYear();
			const month = String(scheduledPickupTime.getMonth() + 1).padStart(2, '0');
			const day = String(scheduledPickupTime.getDate()).padStart(2, '0');
			const dateString = `${year}-${month}-${day}`;

			setEditData({
				scheduledPickupDate: dateString,
				scheduledPickupTime: timeString,
				customerName: booking.customerName || "",
				customerPhone: booking.customerPhone || "",
				customerEmail: booking.customerEmail || "",
				passengerCount: booking.passengerCount || 1,
				luggageCount: booking.luggageCount || 0,
				specialRequests: booking.specialRequests || "",
			});
		}
	}, [booking]);

	// Mobile detection
	const isMobile = useIsMobile();

	// Mutations
	const editMutation = useEditBookingMutation();
	const cancelMutation = useCancelBookingMutation();

	const handleEdit = () => {
		if (!booking?.id || !booking?.canEdit) return;

		// Create Date object from date and time
		const [year, month, day] = editData.scheduledPickupDate.split('-').map(Number);
		const [hours, minutes] = editData.scheduledPickupTime.split(':').map(Number);
		const scheduledPickupTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

		editMutation.mutate({
			bookingId: booking.id,
			scheduledPickupTime,
			customerName: editData.customerName,
			customerPhone: editData.customerPhone,
			customerEmail: editData.customerEmail,
			passengerCount: editData.passengerCount,
			specialRequests: editData.specialRequests,
		}, {
			onSuccess: () => {
				// Close the edit dialog
				onEditOpenChange(false);
			}
		});
	};

	const handleCancel = () => {
		if (!booking?.id || !booking?.canCancel) return;

		cancelMutation.mutate({
			bookingId: booking.id,
			cancellationReason: cancellationReason || undefined,
		}, {
			onSuccess: () => {
				// Only close the dialog on successful cancellation
				onCancelOpenChange(false);
				// Clear the cancellation reason for next time
				setCancellationReason("");
			}
		});
	};

	const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(2)}`;

	const getTimeUntilPickup = () => {
		if (!booking?.hoursUntilPickup) return "";
		const hours = Math.floor(booking.hoursUntilPickup);
		const minutes = Math.floor((booking.hoursUntilPickup % 1) * 60);

		if (hours > 24) {
			return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''}`;
		} else if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else {
			return `${minutes}m`;
		}
	};

	return (
		<>
			{/* Edit Dialog */}
			<Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
				<DialogContent className={cn(
					"[&>button]:hidden", // Hide default close button
					isMobile
						? "max-w-full w-full h-full m-0 rounded-none p-0 bg-gray-50 flex flex-col"
						: "max-w-2xl max-h-[90vh] overflow-y-auto"
				)}>
					{isMobile ? (
						// Mobile fullscreen layout
						<div className="flex flex-col h-full">
							{/* Header */}
							<div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
								<DialogHeader className="flex-1">
									<DialogTitle className="text-left flex items-center gap-2">
										<Edit3 className="h-5 w-5" />
										Edit Booking
									</DialogTitle>
									<DialogDescription className="text-left">
										Time remaining: {getTimeUntilPickup()}
									</DialogDescription>
								</DialogHeader>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onEditOpenChange(false)}
									className="h-8 w-8 p-0"
									disabled={editMutation.isPending}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Scrollable Content */}
							<div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
								{/* Customer Information */}
								<div className="bg-white rounded-lg p-4 border space-y-4">
									<h4 className="font-semibold text-sm">Customer Details</h4>
									<div className="space-y-4">
										<div>
											<Label htmlFor="customerName">Name</Label>
											<Input
												id="customerName"
												value={editData.customerName}
												onChange={(e) => setEditData({ ...editData, customerName: e.target.value })}
											/>
										</div>
										<div>
											<Label htmlFor="customerPhone">Phone</Label>
											<Input
												id="customerPhone"
												value={editData.customerPhone}
												onChange={(e) => setEditData({ ...editData, customerPhone: e.target.value })}
											/>
										</div>
										<div>
											<Label htmlFor="customerEmail">Email</Label>
											<Input
												id="customerEmail"
												type="email"
												value={editData.customerEmail}
												onChange={(e) => setEditData({ ...editData, customerEmail: e.target.value })}
											/>
										</div>
									</div>
								</div>

								{/* Booking Details */}
								<div className="bg-white rounded-lg p-4 border space-y-4">
									<h4 className="font-semibold text-sm">Booking Details</h4>
									<div className="space-y-4">
										{/* Pickup Date & Time */}
										<div>
											<DateTimePicker
												selectedDate={date}
												selectedTime={editData.scheduledPickupTime}
												onDateChange={(selectedDate) => {
													setDate(selectedDate);
													if (selectedDate) {
														// Use local date formatting to avoid timezone conversion
														const year = selectedDate.getFullYear();
														const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
														const day = String(selectedDate.getDate()).padStart(2, '0');
														const localDateString = `${year}-${month}-${day}`;
														setEditData({ ...editData, scheduledPickupDate: localDateString });
													}
												}}
												onTimeChange={(time) => setEditData({ ...editData, scheduledPickupTime: time })}
												dateLabel="Pickup Date *"
												timeLabel="Pickup Time *"
												className="grid-cols-1 gap-4"
											/>
										</div>
										<div>
											<Label htmlFor="passengerCount">Number of Passengers</Label>
											<Input
												id="passengerCount"
												type="number"
												min="1"
												max="8"
												value={editData.passengerCount}
												onChange={(e) => setEditData({ ...editData, passengerCount: parseInt(e.target.value) || 1 })}
											/>
										</div>
										<div>
											<Label htmlFor="luggageCount">Luggage Pieces</Label>
											<Input
												id="luggageCount"
												type="number"
												min="0"
												max="10"
												value={editData.luggageCount}
												onChange={(e) => setEditData({ ...editData, luggageCount: parseInt(e.target.value) || 0 })}
											/>
										</div>
									</div>
								</div>

								{/* Special Requests */}
								<div className="bg-white rounded-lg p-4 border space-y-4">
									<h4 className="font-semibold text-sm">Special Requests</h4>
									<Textarea
										value={editData.specialRequests}
										onChange={(e) => setEditData({ ...editData, specialRequests: e.target.value })}
										placeholder="Any special requests or notes..."
										className="min-h-20"
									/>
								</div>
							</div>

							{/* Sticky Actions - Mobile */}
							<div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
								<div className="flex gap-2">
									<Button
										onClick={handleEdit}
										disabled={editMutation.isPending}
										className="flex-1 h-12"
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
										onClick={() => onEditOpenChange(false)}
										disabled={editMutation.isPending}
										className="flex-1 h-12"
									>
										<X className="h-4 w-4 mr-2" />
										Cancel
									</Button>
								</div>
							</div>
						</div>
					) : (
						// Desktop modal layout
						<>
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2">
									<Edit3 className="h-5 w-5" />
									Edit Booking
								</DialogTitle>
								<DialogDescription>
									Make changes to your booking. Time remaining: {getTimeUntilPickup()}
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-6 py-4">
								{/* Customer Information */}
								<div className="space-y-4">
									<h4 className="font-semibold text-sm">Customer Details</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor="customerName">Name</Label>
											<Input
												id="customerName"
												value={editData.customerName}
												onChange={(e) => setEditData({ ...editData, customerName: e.target.value })}
											/>
										</div>
										<div>
											<Label htmlFor="customerPhone">Phone</Label>
											<Input
												id="customerPhone"
												value={editData.customerPhone}
												onChange={(e) => setEditData({ ...editData, customerPhone: e.target.value })}
											/>
										</div>
										<div className="md:col-span-2">
											<Label htmlFor="customerEmail">Email</Label>
											<Input
												id="customerEmail"
												type="email"
												value={editData.customerEmail}
												onChange={(e) => setEditData({ ...editData, customerEmail: e.target.value })}
											/>
										</div>
									</div>
								</div>

								{/* Booking Details */}
								<div className="space-y-4">
									<h4 className="font-semibold text-sm">Booking Details</h4>
									<div className="space-y-4">
										{/* Pickup Date & Time */}
										<DateTimePicker
											selectedDate={date}
											selectedTime={editData.scheduledPickupTime}
											onDateChange={(selectedDate) => {
												setDate(selectedDate);
												if (selectedDate) {
													// Use local date formatting to avoid timezone conversion
													const year = selectedDate.getFullYear();
													const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
													const day = String(selectedDate.getDate()).padStart(2, '0');
													const localDateString = `${year}-${month}-${day}`;
													setEditData({ ...editData, scheduledPickupDate: localDateString });
												}
											}}
											onTimeChange={(time) => setEditData({ ...editData, scheduledPickupTime: time })}
											dateLabel="Pickup Date *"
											timeLabel="Pickup Time *"
										/>
										{/* Passengers and Luggage */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<Label htmlFor="passengerCount">Number of Passengers</Label>
												<Input
													id="passengerCount"
													type="number"
													min="1"
													max="8"
													value={editData.passengerCount}
													onChange={(e) => setEditData({ ...editData, passengerCount: parseInt(e.target.value) || 1 })}
												/>
											</div>
											<div>
												<Label htmlFor="luggageCount">Luggage Pieces</Label>
												<Input
													id="luggageCount"
													type="number"
													min="0"
													max="10"
													value={editData.luggageCount}
													onChange={(e) => setEditData({ ...editData, luggageCount: parseInt(e.target.value) || 0 })}
												/>
											</div>
										</div>
									</div>
								</div>

								{/* Special Requests */}
								<div className="space-y-4">
									<h4 className="font-semibold text-sm">Special Requests</h4>
									<Textarea
										value={editData.specialRequests}
										onChange={(e) => setEditData({ ...editData, specialRequests: e.target.value })}
										placeholder="Any special requests or notes..."
										className="min-h-20"
									/>
								</div>

								{/* Actions - Desktop */}
								<div className="flex gap-2 pt-4 border-t">
									<Button
										onClick={handleEdit}
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
										onClick={() => onEditOpenChange(false)}
										disabled={editMutation.isPending}
									>
										<X className="h-4 w-4 mr-2" />
										Cancel
									</Button>
								</div>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>

			{/* Cancel Dialog */}
			<AlertDialog open={isCancelOpen} onOpenChange={onCancelOpenChange}>
				<AlertDialogContent className={cn(
					"[&>button]:hidden", // Hide default close button
					isMobile
						? "max-w-full w-full h-full m-0 rounded-none p-0 bg-gray-50 flex flex-col"
						: "max-w-lg"
				)}>
					{isMobile ? (
						// Mobile fullscreen layout
						<div className="flex flex-col h-full">
							{/* Header */}
							<div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
								<AlertDialogHeader className="flex-1">
									<AlertDialogTitle className="text-left flex items-center gap-2 text-red-600">
										<AlertTriangle className="h-5 w-5" />
										Cancel Booking
									</AlertDialogTitle>
								</AlertDialogHeader>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onCancelOpenChange(false)}
									className="h-8 w-8 p-0"
									disabled={cancelMutation.isPending}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Scrollable Content */}
							<div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
								<AlertDialogDescription>
									<div className="space-y-3">
										<p>Are you sure you want to cancel this booking?</p>

										{/* Booking Summary */}
										<div className="bg-white rounded-lg p-3 border space-y-2">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Route:</span>
												<span className="font-medium text-right text-xs">
													{booking?.originAddress?.substring(0, 25)}... →{" "}
													{booking?.destinationAddress?.substring(0, 25)}...
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Amount:</span>
												<span className="font-medium">{formatPrice(booking?.quotedAmount || booking?.amount || booking?.totalAmount || 0)}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Time until pickup:</span>
												<span className="font-medium">{getTimeUntilPickup()}</span>
											</div>
										</div>

										{/* Cancellation Reason */}
										<div className="bg-white rounded-lg p-4 border space-y-2">
											<Label htmlFor="cancellationReason" className="text-sm font-medium">
												Reason for cancellation (optional)
											</Label>
											<Input
												id="cancellationReason"
												placeholder="Let us know why you're cancelling..."
												value={cancellationReason}
												onChange={(e) => setCancellationReason(e.target.value)}
											/>
										</div>
									</div>
								</AlertDialogDescription>
							</div>

							{/* Sticky Actions - Mobile */}
							<div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
								<div className="flex gap-2">
									<Button
										variant="outline"
										onClick={() => onCancelOpenChange(false)}
										disabled={cancelMutation.isPending}
										className="flex-1 h-12"
									>
										Keep Booking
									</Button>
									<Button
										onClick={handleCancel}
										disabled={cancelMutation.isPending}
										className="flex-1 h-12 bg-red-600 hover:bg-red-700"
									>
										{cancelMutation.isPending ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
												Cancelling...
											</>
										) : (
											<>
												<XCircle className="h-4 w-4 mr-2" />
												Cancel Booking
											</>
										)}
									</Button>
								</div>
							</div>
						</div>
					) : (
						// Desktop modal layout
						<>
							<AlertDialogHeader>
								<AlertDialogTitle className="flex items-center gap-2 text-red-600">
									<AlertTriangle className="h-5 w-5" />
									Cancel Booking
								</AlertDialogTitle>
								<AlertDialogDescription>
									<div className="space-y-3">
										<p>Are you sure you want to cancel this booking?</p>

										{/* Booking Summary */}
										<div className="bg-muted/50 p-3 rounded-lg space-y-2">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Route:</span>
												<span className="font-medium text-right">
													{booking?.originAddress?.substring(0, 30)}... →{" "}
													{booking?.destinationAddress?.substring(0, 30)}...
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Amount:</span>
												<span className="font-medium">{formatPrice(booking?.quotedAmount || booking?.amount || booking?.totalAmount || 0)}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Time until pickup:</span>
												<span className="font-medium">{getTimeUntilPickup()}</span>
											</div>
										</div>

										{/* Cancellation Reason */}
										<div className="space-y-2">
											<Label htmlFor="cancellationReason" className="text-sm font-medium">
												Reason for cancellation (optional)
											</Label>
											<Input
												id="cancellationReason"
												placeholder="Let us know why you're cancelling..."
												value={cancellationReason}
												onChange={(e) => setCancellationReason(e.target.value)}
											/>
										</div>
									</div>
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Keep Booking</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleCancel}
									disabled={cancelMutation.isPending}
									className="bg-red-600 hover:bg-red-700"
								>
									{cancelMutation.isPending ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
											Cancelling...
										</>
									) : (
										<>
											<XCircle className="h-4 w-4 mr-2" />
											Cancel Booking
										</>
									)}
								</AlertDialogAction>
							</AlertDialogFooter>
						</>
					)}
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}