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
import { EditIcon, Loader } from "lucide-react";
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

			setFormData({
				scheduledPickupDate: dateString,
				scheduledPickupTime: timeString,
				notes: booking.notes || "",
				quotedAmount: booking.quotedAmount || 0,
				customerName: booking.customerName || "",
				customerPhone: booking.customerPhone || "",
				customerEmail: booking.customerEmail || "",
				passengerCount: booking.passengerCount || 1,
				luggageCount: booking.luggageCount || 0,
				specialRequests: booking.specialRequests || "",
			});
		}
	}, [booking]);

	const updateFormData = (field: keyof EditBookingFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: "" }));
		}
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

		// Convert date and time back to ISO string for backend
		const scheduledPickupTime = createLocalDateForBackend(
			formData.scheduledPickupDate!,
			formData.scheduledPickupTime!
		);

		editBookingMutation.mutate({
			id: booking.id,
			customerName: formData.customerName!,
			customerPhone: formData.customerPhone!,
			customerEmail: formData.customerEmail || "",
			scheduledPickupTime,
			notes: formData.notes || "",
			quotedAmount: formData.quotedAmount || 0, // Store as dollar amount
			passengerCount: formData.passengerCount!,
			luggageCount: formData.luggageCount!,
			specialRequests: formData.specialRequests || "",
		}, {
			onSuccess: () => {
				onOpenChange(false);
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<EditIcon className="h-5 w-5 text-primary" />
						Edit Booking
					</DialogTitle>
					<DialogDescription>
						Update booking details for {booking?.id}
					</DialogDescription>
				</DialogHeader>

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
						/>

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

					{/* Notes */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
							<Textarea
								placeholder="Additional notes or special requests"
								className="min-h-[80px]"
								value={formData.notes || ""}
								onChange={(e) => updateFormData("notes", e.target.value)}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
							<Textarea
								placeholder="Any special requirements, accessibility needs, or requests..."
								className="min-h-[80px]"
								value={formData.specialRequests || ""}
								onChange={(e) => updateFormData("specialRequests", e.target.value)}
							/>
						</div>
					</div>

					<div className="flex gap-3 pt-4">
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