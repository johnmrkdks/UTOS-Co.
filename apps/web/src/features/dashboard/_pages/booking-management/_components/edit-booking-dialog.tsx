import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { EditIcon, Loader, Plus, Trash2 } from "lucide-react";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import * as z from "zod";
import React, { useState } from "react";
import { DateTimePicker } from "@/components/date-time-picker";
import { createLocalDateForBackend } from "@/utils/timezone";
import { useEditBookingMutation } from "../_hooks/query/use-edit-booking-mutation";
import type { Booking } from "./booking-table-columns";

const editBookingSchema = z.object({
	scheduledPickupDate: z.string({ message: "Please select a pickup date" }).min(1, "Please select a pickup date"),
	scheduledPickupTime: z.string({ message: "Please select a pickup time" }).min(1, "Please select a pickup time"),
	notes: z.string().optional(),
	quotedAmount: z.number().positive("Amount must be positive"),
	customerName: z.string().min(1, "Customer name is required"),
	customerPhone: z.string().min(1, "Customer phone is required"),
	customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
	passengerCount: z.number().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers allowed"),
	luggageCount: z.number().min(0, "Luggage count cannot be negative").max(10, "Maximum 10 pieces of luggage allowed"),
	specialRequests: z.string().optional(),
	// Offload booking specific fields
	offloaderName: z.string().optional(),
	jobType: z.string().optional(),
	vehicleType: z.string().optional(),
	// Stops (between pickup and destination)
	stops: z.array(z.object({
		address: z.string().min(1, "Address is required"),
		stopOrder: z.number(),
		latitude: z.number().optional(),
		longitude: z.number().optional(),
	})).optional(),
});

type EditBookingFormData = z.infer<typeof editBookingSchema>;

interface EditBookingDialogProps {
	booking: Booking | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditBookingDialog({
	booking,
	open,
	onOpenChange,
}: EditBookingDialogProps) {
	const editBookingMutation = useEditBookingMutation();
	const [date, setDate] = useState<Date>();
	const [formData, setFormData] = useState<Partial<EditBookingFormData>>({});
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	// Update form data when booking changes
	React.useEffect(() => {
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

			const sortedStops = (booking.stops || [])
				.sort((a: { stopOrder: number }, b: { stopOrder: number }) => a.stopOrder - b.stopOrder)
				.map((s: { address: string; stopOrder: number; latitude?: number; longitude?: number }) => ({
					address: s.address,
					stopOrder: s.stopOrder,
					latitude: s.latitude,
					longitude: s.longitude,
				}));

			setFormData({
				scheduledPickupDate: dateString,
				scheduledPickupTime: timeString,
				notes: booking.additionalNotes || "",
				quotedAmount: booking.quotedAmount || 0,
				customerName: booking.customerName || "",
				customerPhone: booking.customerPhone || "",
				customerEmail: booking.customerEmail ?? "", // Use nullish coalescing to handle null
				passengerCount: booking.passengerCount || 1,
				luggageCount: booking.luggageCount || 0,
				specialRequests: booking.specialRequests || "",
				offloaderName: booking.offloadDetails?.offloaderName || "",
				jobType: booking.offloadDetails?.jobType || "",
				vehicleType: booking.offloadDetails?.vehicleType || "",
				stops: sortedStops.length > 0 ? sortedStops : [],
			});
		}
	}, [booking]);

	const updateFormData = (field: keyof EditBookingFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const addStop = () => {
		const currentStops = formData.stops || [];
		setFormData(prev => ({
			...prev,
			stops: [...currentStops, { address: "", stopOrder: currentStops.length + 1 }],
		}));
	};

	const removeStop = (index: number) => {
		const currentStops = formData.stops || [];
		const newStops = currentStops.filter((_, i) => i !== index).map((s, i) => ({ ...s, stopOrder: i + 1 }));
		setFormData(prev => ({ ...prev, stops: newStops }));
	};

	const updateStopAddress = (index: number, address: string, lat?: number, lng?: number) => {
		const currentStops = formData.stops || [];
		const newStops = [...currentStops];
		newStops[index] = {
			...newStops[index],
			address,
			...(lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)
				? { latitude: lat, longitude: lng }
				: { latitude: undefined, longitude: undefined }),
		};
		setFormData(prev => ({ ...prev, stops: newStops }));
	};

	const validateForm = () => {
		try {
			// Ensure all fields have default values to avoid undefined errors
			const cleanedFormData = {
				scheduledPickupDate: formData.scheduledPickupDate || "",
				scheduledPickupTime: formData.scheduledPickupTime || "",
				customerName: formData.customerName || "",
				customerPhone: formData.customerPhone || "",
				customerEmail: formData.customerEmail || "",
				quotedAmount: formData.quotedAmount || 0,
				passengerCount: formData.passengerCount || 1,
				luggageCount: formData.luggageCount || 0,
				notes: formData.notes || "",
				specialRequests: formData.specialRequests || "",
				// Offload booking specific fields
				offloaderName: formData.offloaderName || "",
				jobType: formData.jobType || "",
				vehicleType: formData.vehicleType || "",
			};

			editBookingSchema.parse(cleanedFormData);
			setFormErrors({});
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors: Record<string, string> = {};
				error.issues.forEach((err) => {
					if (err.path.length > 0) {
						errors[err.path[0] as string] = err.message;
					}
				});
				setFormErrors(errors);
			}
			return false;
		}
	};

	const handleSubmit = () => {
		if (!booking?.id) return;

		if (!validateForm()) {
			return;
		}

		// Convert date and time back to Date object for backend
		const scheduledPickupTimeString = createLocalDateForBackend(
			formData.scheduledPickupDate!,
			formData.scheduledPickupTime!
		);
		const scheduledPickupTime = new Date(scheduledPickupTimeString);

		const stopsPayload = (formData.stops || [])
			.filter((s) => s.address?.trim())
			.map((s, i) => ({
				address: s.address.trim(),
				stopOrder: i + 1,
				waitingTime: 0,
				...(s.latitude != null && s.longitude != null ? { latitude: s.latitude, longitude: s.longitude } : {}),
			}));

		editBookingMutation.mutate({
			id: booking.id,
			data: {
				customerName: formData.customerName!,
				customerPhone: formData.customerPhone!,
				customerEmail: formData.customerEmail || "",
				scheduledPickupTime: scheduledPickupTime,
				additionalNotes: formData.notes || "",
				quotedAmount: formData.quotedAmount || 0,
				passengerCount: formData.passengerCount!,
				luggageCount: formData.luggageCount!,
				specialRequests: formData.specialRequests || "",
			} as any,
			stops: stopsPayload,
		}, {
			onSuccess: () => {
				onOpenChange(false);
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
				{/* Sticky Header */}
				<div className="sticky top-0 bg-white z-10 border-b px-6 pt-6 pb-4">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<EditIcon className="h-5 w-5 text-primary" />
							Edit Booking
						</DialogTitle>
						<DialogDescription>
							Update booking details for {booking?.id}
						</DialogDescription>
					</DialogHeader>
				</div>

				{/* Scrollable Content */}
				<div className="flex-1 overflow-y-auto px-6 py-4">
					<div className="space-y-6">
					{/* Customer Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Customer Information</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
								<Input
									placeholder="Full name"
									value={formData.customerName || ""}
									onChange={(e) => updateFormData("customerName", e.target.value)}
									className={formErrors.customerName ? "border-red-500" : ""}
								/>
								{formErrors.customerName && (
									<p className="text-red-500 text-sm mt-1">{formErrors.customerName}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
								<Input
									placeholder="+61 XXX XXX XXX"
									value={formData.customerPhone || ""}
									onChange={(e) => updateFormData("customerPhone", e.target.value)}
									className={formErrors.customerPhone ? "border-red-500" : ""}
								/>
								{formErrors.customerPhone && (
									<p className="text-red-500 text-sm mt-1">{formErrors.customerPhone}</p>
								)}
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
								<Input
									placeholder="customer@email.com"
									value={formData.customerEmail || ""}
									onChange={(e) => updateFormData("customerEmail", e.target.value)}
									className={formErrors.customerEmail ? "border-red-500" : ""}
								/>
								{formErrors.customerEmail && (
									<p className="text-red-500 text-sm mt-1">{formErrors.customerEmail}</p>
								)}
							</div>
						</div>
					</div>

					{/* Booking Details */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Booking Details</h3>

						{/* Date and Time Picker */}
						<DateTimePicker
							selectedDate={date}
							selectedTime={formData.scheduledPickupTime || ""}
							onDateChange={(selectedDate) => {
								setDate(selectedDate);
								if (selectedDate) {
									// Use local date formatting to avoid timezone conversion
									const year = selectedDate.getFullYear();
									const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
									const day = String(selectedDate.getDate()).padStart(2, '0');
									const localDateString = `${year}-${month}-${day}`;
									updateFormData("scheduledPickupDate", localDateString);
								}
							}}
							onTimeChange={(time) => updateFormData("scheduledPickupTime", time)}
							dateError={formErrors.scheduledPickupDate}
							timeError={formErrors.scheduledPickupTime}
							dateLabel="Pickup Date *"
							timeLabel="Pickup Time *"
							allowPastDates={true}
						/>

						{/* Additional Stops */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<label className="block text-sm font-medium text-gray-700">Additional Stops</label>
								<Button type="button" variant="outline" size="sm" onClick={addStop}>
									<Plus className="h-4 w-4 mr-1" />
									Add Stop
								</Button>
							</div>
							<p className="text-xs text-gray-500">Add intermediate stops between pickup and destination (e.g. client requests an extra stop before the trip)</p>
							{(formData.stops || []).map((stop, index) => (
								<div key={index} className="flex gap-2 items-center">
									<span className="text-sm font-medium text-gray-500 w-8 shrink-0">Stop {index + 1}</span>
									<div className="flex-1 min-w-0">
										<GooglePlacesInput
											value={stop.address}
											onChange={(value) => updateStopAddress(index, value)}
											onPlaceSelect={(place) => {
												const lat = place.geometry?.location?.lat?.();
												const lng = place.geometry?.location?.lng?.();
												updateStopAddress(
													index,
													place.description,
													lat,
													lng
												);
											}}
											placeholder="Enter address..."
											className="w-full"
										/>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeStop(index)}
										className="text-destructive hover:text-destructive shrink-0"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>

						{/* Passengers and Luggage */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Number of Passengers *</label>
								<Input
									type="number"
									min="1"
									max="8"
									placeholder="e.g. 2"
									value={formData.passengerCount || ""}
									onChange={(e) => updateFormData("passengerCount", e.target.value ? parseInt(e.target.value) : undefined)}
									className={formErrors.passengerCount ? "border-red-500" : ""}
								/>
								{formErrors.passengerCount && (
									<p className="text-red-500 text-sm mt-1">{formErrors.passengerCount}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Luggage Pieces *</label>
								<Input
									type="number"
									min="0"
									max="10"
									placeholder="e.g. 3"
									value={formData.luggageCount || ""}
									onChange={(e) => updateFormData("luggageCount", e.target.value ? parseInt(e.target.value) : undefined)}
									className={formErrors.luggageCount ? "border-red-500" : ""}
								/>
								{formErrors.luggageCount && (
									<p className="text-red-500 text-sm mt-1">{formErrors.luggageCount}</p>
								)}
							</div>
						</div>
					</div>

					{/* Pricing */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Pricing</h3>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Quoted Amount (AUD) *</label>
							<Input
								type="number"
								step="0.01"
								placeholder="0.00"
								value={formData.quotedAmount || ""}
								onChange={(e) => updateFormData("quotedAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
								className={formErrors.quotedAmount ? "border-red-500" : ""}
							/>
							{formErrors.quotedAmount && (
								<p className="text-red-500 text-sm mt-1">{formErrors.quotedAmount}</p>
							)}
						</div>
					</div>

					{/* Offload Booking Specific Fields */}
					{booking?.bookingType === 'offload' && (
						<div className="space-y-4 border-t pt-4">
							<h3 className="text-lg font-semibold text-orange-700">Offload Booking Details</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
									<Input
										placeholder="Offloader company name"
										value={formData.offloaderName || ""}
										onChange={(e) => updateFormData("offloaderName", e.target.value)}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
									<Input
										placeholder="e.g., Transfer, Tour"
										value={formData.jobType || ""}
										onChange={(e) => updateFormData("jobType", e.target.value)}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
									<Input
										placeholder="e.g., Sedan, SUV"
										value={formData.vehicleType || ""}
										onChange={(e) => updateFormData("vehicleType", e.target.value)}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Notes */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Driver Notes (Optional)</label>
							<Textarea
								placeholder="Internal operational notes for drivers and admins..."
								className="min-h-[80px]"
								value={formData.notes || ""}
								onChange={(e) => updateFormData("notes", e.target.value)}
							/>
							<p className="text-xs text-gray-500 mt-1">Only visible to drivers and admins</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Client Special Requests (Optional)</label>
							<Textarea
								placeholder="Customer's special requirements, accessibility needs, or requests..."
								className="min-h-[80px]"
								value={formData.specialRequests || ""}
								onChange={(e) => updateFormData("specialRequests", e.target.value)}
							/>
							<p className="text-xs text-gray-500 mt-1">Visible to customer and shown in booking confirmation</p>
						</div>
					</div>
					</div>
				</div>

				{/* Sticky Footer */}
				<div className="sticky bottom-0 bg-white z-10 border-t px-6 py-4">
					<div className="flex gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={editBookingMutation.isPending}
							className="flex-1 bg-primary hover:bg-primary/90"
						>
							{editBookingMutation.isPending ? (
								<>
									<Loader className="h-4 w-4 mr-2 animate-spin" />
									Updating...
								</>
							) : (
								"Update Booking"
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}