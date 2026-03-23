import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImprovedDateTimePicker } from "@/components/improved-datetime-picker";
import { useCreateCustomBookingFromQuoteMutation } from "@/features/customer/_hooks/query/use-create-custom-booking-from-quote-mutation";

const quoteBookingSchema = z.object({
	customerName: z.string().min(2, "Name must be at least 2 characters"),
	customerEmail: z.string().email("Please enter a valid email"),
	customerPhone: z.string().min(10, "Please enter a valid phone number"),
	passengerCount: z
		.number()
		.min(1, "At least 1 passenger required")
		.max(8, "Maximum 8 passengers allowed"),
	luggageCount: z
		.number()
		.int()
		.min(0, "Luggage count cannot be negative")
		.max(10, "Maximum 10 pieces of luggage allowed"),
	scheduledPickupTime: z
		.date({
			message: "Please select a pickup date and time",
		})
		.refine(
			(date) => {
				const now = new Date();
				const hoursUntilPickup =
					(date.getTime() - now.getTime()) / (1000 * 60 * 60);
				return hoursUntilPickup >= 1;
			},
			{
				message: "Custom bookings require at least 1 hour advance notice",
			},
		),
	specialRequirements: z.string().optional(),
});

type QuoteBookingFormData = z.infer<typeof quoteBookingSchema>;

interface QuoteBookingFormProps {
	quoteData: {
		origin: string;
		destination: string;
		distance: number;
		duration: number;
		totalFare: number;
	};
}

export function QuoteBookingForm({ quoteData }: QuoteBookingFormProps) {
	const createBookingMutation = useCreateCustomBookingFromQuoteMutation();

	const form = useForm<QuoteBookingFormData>({
		resolver: zodResolver(quoteBookingSchema),
		defaultValues: {
			customerName: "",
			customerEmail: "",
			customerPhone: "",
			scheduledPickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
			specialRequirements: "",
		},
	});

	const onSubmit = (data: QuoteBookingFormData) => {
		const bookingData = {
			origin: quoteData.origin,
			destination: quoteData.destination,
			customerName: data.customerName,
			customerEmail: data.customerEmail,
			customerPhone: data.customerPhone,
			passengerCount: data.passengerCount,
			luggageCount: data.luggageCount,
			scheduledPickupTime: data.scheduledPickupTime,
			specialRequirements: data.specialRequirements,
			distance: quoteData.distance,
			duration: quoteData.duration,
			totalAmount: quoteData.totalFare,
		};

		createBookingMutation.mutate(bookingData, {
			onSuccess: () => {
				form.reset();
			},
		});
	};

	// Minimum booking date is today
	const minDate = new Date();

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			{/* Customer Details */}
			<div className="space-y-4">
				<h3 className="font-semibold">Contact Information</h3>

				<div>
					<label className="mb-1 block font-medium text-sm">Full Name</label>
					<Input
						{...form.register("customerName")}
						placeholder="Enter your full name"
						error={form.formState.errors.customerName?.message}
					/>
				</div>

				<div>
					<label className="mb-1 block font-medium text-sm">Email</label>
					<Input
						type="email"
						{...form.register("customerEmail")}
						placeholder="Enter your email"
						error={form.formState.errors.customerEmail?.message}
					/>
				</div>

				<div>
					<label className="mb-1 block font-medium text-sm">Phone Number</label>
					<Input
						type="tel"
						{...form.register("customerPhone")}
						placeholder="Enter your phone number"
						error={form.formState.errors.customerPhone?.message}
					/>
				</div>
			</div>

			{/* Booking Details */}
			<div className="space-y-4">
				<h3 className="font-semibold">Trip Details</h3>

				{/* Passengers and Luggage side by side */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label className="mb-1 block font-medium text-sm">
							Number of Passengers *
						</label>
						<p className="mb-2 text-gray-600 text-xs">
							Maximum capacity: 8 passengers
						</p>
						<Input
							type="number"
							min={1}
							max={8}
							placeholder="e.g. 2"
							{...form.register("passengerCount", { valueAsNumber: true })}
							error={form.formState.errors.passengerCount?.message}
						/>
					</div>

					<div>
						<label className="mb-1 block font-medium text-sm">
							Luggage Pieces *
						</label>
						<p className="mb-2 text-gray-600 text-xs">
							Maximum capacity: 10 pieces of luggage
						</p>
						<Input
							type="number"
							min={0}
							max={10}
							placeholder="e.g. 3"
							{...form.register("luggageCount", { valueAsNumber: true })}
							error={form.formState.errors.luggageCount?.message}
						/>
					</div>
				</div>

				<div>
					<label className="mb-1 block font-medium text-sm">
						Pickup Date & Time
					</label>
					<ImprovedDateTimePicker
						value={form.getValues("scheduledPickupTime")}
						onChange={(date) => form.setValue("scheduledPickupTime", date)}
						placeholder="Select pickup date and time"
						minDate={minDate}
					/>
					{form.formState.errors.scheduledPickupTime && (
						<p className="mt-1 text-red-600 text-sm">
							{form.formState.errors.scheduledPickupTime.message}
						</p>
					)}
				</div>

				<div>
					<label className="mb-1 block font-medium text-sm">
						Special Requirements (Optional)
					</label>
					<Textarea
						{...form.register("specialRequirements")}
						placeholder="Any special requests or requirements..."
						rows={3}
					/>
				</div>
			</div>

			{/* Pricing Summary */}
			<div className="border-t pt-4">
				<div className="mb-4 flex items-center justify-between">
					<span className="font-semibold">Total Fare:</span>
					<span className="font-bold text-2xl text-green-600">
						${quoteData.totalFare.toFixed(2)}
					</span>
				</div>
				<p className="mb-4 text-gray-500 text-xs">
					Payment will be processed after booking confirmation.
				</p>
			</div>

			<Button
				type="submit"
				className="w-full"
				disabled={createBookingMutation.isPending}
			>
				{createBookingMutation.isPending ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Creating Booking...
					</>
				) : (
					"Book Trip"
				)}
			</Button>

			<p className="text-center text-gray-500 text-xs">
				By booking, you agree to our terms of service and privacy policy.
			</p>
		</form>
	);
}
