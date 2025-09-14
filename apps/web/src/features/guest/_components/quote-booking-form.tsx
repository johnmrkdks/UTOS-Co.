import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCustomBookingFromQuoteMutation } from "@/features/customer/_hooks/query/use-create-custom-booking-from-quote-mutation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { ImprovedDateTimePicker } from "@/components/improved-datetime-picker";
import { Loader2 } from "lucide-react";

const quoteBookingSchema = z.object({
	customerName: z.string().min(2, "Name must be at least 2 characters"),
	customerEmail: z.string().email("Please enter a valid email"),
	customerPhone: z.string().min(10, "Please enter a valid phone number"),
	passengerCount: z.number().min(1, "At least 1 passenger required").max(8, "Maximum 8 passengers allowed"),
	luggageCount: z.number().int().min(0, "Luggage count cannot be negative").max(10, "Maximum 10 pieces of luggage allowed").default(0),
	scheduledPickupTime: z.date({
		required_error: "Please select a pickup date and time",
	}),
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
			passengerCount: 1,
			luggageCount: 0,
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
			luggageCount: data.luggageCount || 0,
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
					<label className="block text-sm font-medium mb-1">Full Name</label>
					<Input
						{...form.register("customerName")}
						placeholder="Enter your full name"
						error={form.formState.errors.customerName?.message}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Email</label>
					<Input
						type="email"
						{...form.register("customerEmail")}
						placeholder="Enter your email"
						error={form.formState.errors.customerEmail?.message}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Phone Number</label>
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
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium mb-1">Number of Passengers</label>
						<Input
							type="number"
							min={1}
							max={8}
							{...form.register("passengerCount", { valueAsNumber: true })}
							error={form.formState.errors.passengerCount?.message}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Luggage Pieces</label>
						<Input
							type="number"
							min={0}
							max={10}
							{...form.register("luggageCount", { valueAsNumber: true })}
							error={form.formState.errors.luggageCount?.message}
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Pickup Date & Time</label>
					<ImprovedDateTimePicker
						value={form.getValues("scheduledPickupTime")}
						onChange={(date) => form.setValue("scheduledPickupTime", date)}
						placeholder="Select pickup date and time"
						minDate={minDate}
					/>
					{form.formState.errors.scheduledPickupTime && (
						<p className="text-sm text-red-600 mt-1">
							{form.formState.errors.scheduledPickupTime.message}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Special Requirements (Optional)</label>
					<Textarea
						{...form.register("specialRequirements")}
						placeholder="Any special requests or requirements..."
						rows={3}
					/>
				</div>
			</div>

			{/* Pricing Summary */}
			<div className="border-t pt-4">
				<div className="flex justify-between items-center mb-4">
					<span className="font-semibold">Total Fare:</span>
					<span className="text-2xl font-bold text-green-600">
						${quoteData.totalFare.toFixed(2)}
					</span>
				</div>
				<p className="text-xs text-gray-500 mb-4">
					Payment will be processed after booking confirmation. No payment required now.
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

			<p className="text-xs text-gray-500 text-center">
				By booking, you agree to our terms of service and privacy policy.
			</p>
		</form>
	);
}