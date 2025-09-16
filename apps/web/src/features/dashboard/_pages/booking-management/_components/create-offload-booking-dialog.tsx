import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { CalendarIcon, TruckIcon } from "lucide-react";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import { offloadBookingSchema, type OffloadBookingFormData } from "../_schemas/offload-booking-schema";
import { useCreateOffloadBookingMutation } from "../_hooks/query/use-create-offload-booking-mutation";
import { format } from "date-fns";

export function CreateOffloadBookingDialog() {
	const { isCreateOffloadBookingDialogOpen, closeCreateOffloadBookingDialog } = useBookingManagementModalProvider();
	const createOffloadBookingMutation = useCreateOffloadBookingMutation();

	const [dateTimeValue, setDateTimeValue] = useState("");

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
		}
	});

	const watchedPrice = watch("price");

	const onSubmit = async (data: OffloadBookingFormData) => {
		// Convert form data to the format expected by the backend
		const bookingData = {
			offloaderName: data.offloaderName,
			jobType: data.jobType,
			originAddress: data.pickupAddress,
			destinationAddress: data.destinationAddress,
			vehicleType: data.vehicleType,
			quotedAmount: Math.round(data.price * 100), // Convert to cents
			scheduledPickupTime: data.scheduledPickupTime.toISOString(),
			notes: data.notes || "",
			bookingType: "offload" as const,
		};

		try {
			await createOffloadBookingMutation.mutateAsync(bookingData);
			// Reset form and close dialog only on success
			reset();
			setDateTimeValue("");
			closeCreateOffloadBookingDialog();
		} catch (error) {
			console.error("Failed to create offload booking:", error);
			// Dialog stays open on error so user can retry
		}
	};

	const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setDateTimeValue(value);
		if (value) {
			setValue("scheduledPickupTime", new Date(value));
		}
	};

	const handleClose = () => {
		reset();
		setDateTimeValue("");
		closeCreateOffloadBookingDialog();
	};

	return (
		<Dialog open={isCreateOffloadBookingDialogOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TruckIcon className="h-5 w-5 text-orange-600" />
						Create Offload Booking
					</DialogTitle>
					<DialogDescription>
						Add a manual booking from another company to help with workload distribution.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
						<Input
							id="pickupAddress"
							placeholder="Enter pickup location"
							{...register("pickupAddress")}
							className={errors.pickupAddress ? "border-red-500" : ""}
						/>
						{errors.pickupAddress && (
							<p className="text-sm text-red-600">{errors.pickupAddress.message}</p>
						)}
					</div>

					{/* Destination Address */}
					<div className="space-y-2">
						<Label htmlFor="destinationAddress">Destination Address *</Label>
						<Input
							id="destinationAddress"
							placeholder="Enter destination location"
							{...register("destinationAddress")}
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
								{...register("price", { valueAsNumber: true })}
							/>
						</div>
						{errors.price && (
							<p className="text-sm text-red-600">{errors.price.message}</p>
						)}
					</div>

					{/* Scheduled Pickup Time */}
					<div className="space-y-2">
						<Label htmlFor="scheduledPickupTime">Scheduled Pickup Time *</Label>
						<div className="relative">
							<CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
							<Input
								id="scheduledPickupTime"
								type="datetime-local"
								value={dateTimeValue}
								onChange={handleDateTimeChange}
								className={`pl-10 ${errors.scheduledPickupTime ? "border-red-500" : ""}`}
								min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
							/>
						</div>
						{errors.scheduledPickupTime && (
							<p className="text-sm text-red-600">{errors.scheduledPickupTime.message}</p>
						)}
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
					{watchedPrice && watchedPrice > 0 && (
						<div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-orange-800">Total Price:</span>
								<span className="text-lg font-bold text-orange-900">
									${watchedPrice.toFixed(2)} AUD
								</span>
							</div>
						</div>
					)}

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