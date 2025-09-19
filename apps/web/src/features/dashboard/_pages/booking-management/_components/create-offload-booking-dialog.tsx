import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { TruckIcon, UserIcon, UsersIcon, LuggageIcon } from "lucide-react";
import { DateTimePicker } from "@/components/date-time-picker";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import { offloadBookingSchema, type OffloadBookingFormData } from "../_schemas/offload-booking-schema";
import { useCreateOffloadBookingMutation } from "../_hooks/query/use-create-offload-booking-mutation";

export function CreateOffloadBookingDialog() {
	const { isCreateOffloadBookingDialogOpen, closeCreateOffloadBookingDialog } = useBookingManagementModalProvider();
	const createOffloadBookingMutation = useCreateOffloadBookingMutation();

	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedTime, setSelectedTime] = useState("");
	const [pickupAddress, setPickupAddress] = useState("");
	const [destinationAddress, setDestinationAddress] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		reset,
		watch
	} = useForm<OffloadBookingFormData>({
		resolver: zodResolver(offloadBookingSchema),
		defaultValues: {
			notes: "",
			// Remove default values for optional fields
		}
	});

	const watchedPrice = watch("price");
	const displayPrice = watchedPrice && !isNaN(watchedPrice) && watchedPrice > 0 ? watchedPrice : null;

	const onSubmit = async (data: OffloadBookingFormData) => {
		// Convert form data to the format expected by the backend
		const bookingData = {
			offloaderName: data.offloaderName,
			jobType: data.jobType,
			originAddress: data.pickupAddress,
			destinationAddress: data.destinationAddress,
			vehicleType: data.vehicleType,
			quotedAmount: data.price, // Store as dollar amount
			scheduledPickupTime: data.scheduledPickupTime.toISOString(),
			customerName: data.customerName,
			customerPhone: data.customerPhone,
			passengerCount: data.passengerCount || 1,
			luggageCount: data.luggageCount || 0,
			notes: data.notes || "",
			bookingType: "offload" as const,
		};

		try {
			await createOffloadBookingMutation.mutateAsync(bookingData);
			// Reset form and close dialog only on success
			reset();
			setSelectedDate(null);
			setSelectedTime("");
			setPickupAddress("");
			setDestinationAddress("");
			closeCreateOffloadBookingDialog();
		} catch (error) {
			console.error("Failed to create offload booking:", error);
			// Dialog stays open on error so user can retry
		}
	};

	const handleClose = () => {
		reset();
		setSelectedDate(null);
		setSelectedTime("");
		setPickupAddress("");
		setDestinationAddress("");
		closeCreateOffloadBookingDialog();
	};

	return (
		<Dialog open={isCreateOffloadBookingDialogOpen} onOpenChange={handleClose}>
			<DialogContent className="!max-w-6xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TruckIcon className="h-5 w-5 text-orange-600" />
						Create Offload Booking
					</DialogTitle>
					<DialogDescription>
						Add a manual booking from another company to help with workload distribution.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* 2-Column Layout */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Left Column - Booking Details */}
						<div className="space-y-4">
							<div className="pb-2 border-b">
								<h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
									<TruckIcon className="h-5 w-5 text-orange-600" />
									Booking Details
								</h3>
							</div>

							{/* Offloader Name */}
							<div className="space-y-2">
								<Label htmlFor="offloaderName">Offloader Name *</Label>
								<Input
									id="offloaderName"
									placeholder="Company name"
									{...register("offloaderName")}
									className={errors.offloaderName ? "border-red-500" : ""}
								/>
								{errors.offloaderName && (
									<p className="text-sm text-red-600">{errors.offloaderName.message}</p>
								)}
							</div>

							{/* Job Type */}
							<div className="space-y-2">
								<Label htmlFor="jobType">Job Type *</Label>
								<Input
									id="jobType"
									placeholder="e.g., Airport Transfer, Corporate Event"
									{...register("jobType")}
									className={errors.jobType ? "border-red-500" : ""}
								/>
								{errors.jobType && (
									<p className="text-sm text-red-600">{errors.jobType.message}</p>
								)}
							</div>

							{/* Pickup Address */}
							<div className="space-y-2">
								<Label htmlFor="pickupAddress">Pickup Address *</Label>
								<GooglePlacesInput
									value={pickupAddress}
									onChange={(value) => {
										setPickupAddress(value);
										setValue("pickupAddress", value);
									}}
									placeholder="Enter pickup location in NSW..."
									className={errors.pickupAddress ? "border-red-500" : ""}
								/>
								{errors.pickupAddress && (
									<p className="text-sm text-red-600">{errors.pickupAddress.message}</p>
								)}
							</div>

							{/* Destination Address */}
							<div className="space-y-2">
								<Label htmlFor="destinationAddress">Destination Address *</Label>
								<GooglePlacesInput
									value={destinationAddress}
									onChange={(value) => {
										setDestinationAddress(value);
										setValue("destinationAddress", value);
									}}
									placeholder="Enter destination location in NSW..."
									className={errors.destinationAddress ? "border-red-500" : ""}
								/>
								{errors.destinationAddress && (
									<p className="text-sm text-red-600">{errors.destinationAddress.message}</p>
								)}
							</div>

							{/* Vehicle Type */}
							<div className="space-y-2">
								<Label htmlFor="vehicleType">Vehicle Type *</Label>
								<Input
									id="vehicleType"
									placeholder="e.g., Sedan, SUV, Van, Luxury Car"
									{...register("vehicleType")}
									className={errors.vehicleType ? "border-red-500" : ""}
								/>
								{errors.vehicleType && (
									<p className="text-sm text-red-600">{errors.vehicleType.message}</p>
								)}
							</div>

							{/* Price */}
							<div className="space-y-2">
								<Label htmlFor="price">Price (AUD) *</Label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
									<Input
										id="price"
										type="number"
										step="0.01"
										min="0"
										max="999999"
										placeholder="0.00"
										className={`pl-8 ${errors.price ? "border-red-500" : ""}`}
										{...register("price", {
											setValueAs: (value) => value === "" ? 0 : parseFloat(value) || 0
										})}
									/>
								</div>
								{errors.price && (
									<p className="text-sm text-red-600">{errors.price.message}</p>
								)}
							</div>
						</div>

						{/* Right Column - Customer Details & Schedule */}
						<div className="space-y-4">
							<div className="pb-2 border-b">
								<h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
									<UserIcon className="h-5 w-5 text-blue-600" />
									Customer Details
								</h3>
							</div>

							{/* Customer Name */}
							<div className="space-y-2">
								<Label htmlFor="customerName">Customer Name *</Label>
								<Input
									id="customerName"
									placeholder="Enter customer's full name"
									{...register("customerName")}
									className={errors.customerName ? "border-red-500" : ""}
								/>
								{errors.customerName && (
									<p className="text-sm text-red-600">{errors.customerName.message}</p>
								)}
							</div>

							{/* Customer Phone */}
							<div className="space-y-2">
								<Label htmlFor="customerPhone">Customer Phone *</Label>
								<Input
									id="customerPhone"
									placeholder="Enter customer's phone number"
									{...register("customerPhone")}
									className={errors.customerPhone ? "border-red-500" : ""}
								/>
								{errors.customerPhone && (
									<p className="text-sm text-red-600">{errors.customerPhone.message}</p>
								)}
							</div>

							{/* Optional fields in a row */}
							<div className="grid grid-cols-2 gap-3">
								{/* Number of Passengers */}
								<div className="space-y-2">
									<Label htmlFor="passengerCount">
										<div className="flex items-center gap-1">
											<UsersIcon className="h-3 w-3" />
											Passengers (Optional)
										</div>
									</Label>
									<Input
										id="passengerCount"
										type="number"
										min="1"
										max="20"
										placeholder="e.g. 2"
										{...register("passengerCount", {
											setValueAs: (value) => value === "" ? undefined : parseInt(value) || undefined
										})}
										className={errors.passengerCount ? "border-red-500" : ""}
									/>
									{errors.passengerCount && (
										<p className="text-sm text-red-600">{errors.passengerCount.message}</p>
									)}
								</div>

								{/* Luggage Count */}
								<div className="space-y-2">
									<Label htmlFor="luggageCount">
										<div className="flex items-center gap-1">
											<LuggageIcon className="h-3 w-3" />
											Luggage (Optional)
										</div>
									</Label>
									<Input
										id="luggageCount"
										type="number"
										min="0"
										max="50"
										placeholder="e.g. 3"
										{...register("luggageCount", {
											setValueAs: (value) => value === "" ? undefined : parseInt(value) || undefined
										})}
										className={errors.luggageCount ? "border-red-500" : ""}
									/>
									{errors.luggageCount && (
										<p className="text-sm text-red-600">{errors.luggageCount.message}</p>
									)}
								</div>
							</div>

							{/* Scheduled Pickup Date & Time using DateTimePicker */}
							<div className="space-y-2">
								<Label>Scheduled Pickup Date & Time *</Label>
								<DateTimePicker
									selectedDate={selectedDate}
									selectedTime={selectedTime}
									onDateChange={(date) => {
										setSelectedDate(date);
										if (date && selectedTime) {
											const [hours, minutes] = selectedTime.split(':');
											const dateTime = new Date(date);
											dateTime.setHours(parseInt(hours), parseInt(minutes));
											setValue("scheduledPickupTime", dateTime);
										}
									}}
									onTimeChange={(time) => {
										setSelectedTime(time);
										if (selectedDate && time) {
											const [hours, minutes] = time.split(':');
											const dateTime = new Date(selectedDate);
											dateTime.setHours(parseInt(hours), parseInt(minutes));
											setValue("scheduledPickupTime", dateTime);
										}
									}}
									dateError={errors.scheduledPickupTime?.message}
									timeError={errors.scheduledPickupTime?.message}
								/>
							</div>

							{/* Notes */}
							<div className="space-y-2">
								<Label htmlFor="notes">Notes (Optional)</Label>
								<Textarea
									id="notes"
									placeholder="Additional information or special requirements"
									rows={3}
									{...register("notes")}
									className={errors.notes ? "border-red-500" : ""}
								/>
								{errors.notes && (
									<p className="text-sm text-red-600">{errors.notes.message}</p>
								)}
							</div>

							{/* Price Summary */}
							{displayPrice && (
								<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium text-orange-800">Total Price:</span>
										<span className="text-lg font-bold text-orange-900">
											${displayPrice.toFixed(2)} AUD
										</span>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							className="flex-1"
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="flex-1"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Creating..." : "Create Offload Booking"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}