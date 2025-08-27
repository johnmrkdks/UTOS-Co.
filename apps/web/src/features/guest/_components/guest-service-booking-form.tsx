import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";

const guestBookingSchema = z.object({
	customerName: z.string().min(2, "Name must be at least 2 characters"),
	customerEmail: z.string().email("Please enter a valid email"),
	customerPhone: z.string().min(10, "Please enter a valid phone number"),
	passengerCount: z.number().min(1, "At least 1 passenger required"),
	bookingDate: z.date({
		required_error: "Please select a booking date",
	}),
	bookingTime: z.string().min(1, "Please select a booking time"),
	specialRequirements: z.string().optional(),
});

type GuestBookingFormData = z.infer<typeof guestBookingSchema>;

interface GuestServiceBookingFormProps {
	service: {
		id: string;
		name: string;
		price: number;
		maxPassengers?: number;
		advanceBookingRequired?: number;
	};
}

export function GuestServiceBookingForm({ service }: GuestServiceBookingFormProps) {
	const [date, setDate] = useState<Date>();
	const queryClient = useQueryClient();

	const form = useForm<GuestBookingFormData>({
		resolver: zodResolver(guestBookingSchema),
		defaultValues: {
			customerName: "",
			customerEmail: "",
			customerPhone: "",
			passengerCount: 1,
			bookingTime: "",
			specialRequirements: "",
		},
	});

	const createBookingMutation = useMutation({
		mutationFn: async (data: GuestBookingFormData) => {
			const bookingData = {
				packageId: service.id,
				customerName: data.customerName,
				customerEmail: data.customerEmail,
				customerPhone: data.customerPhone,
				passengerCount: data.passengerCount,
				bookingDate: data.bookingDate,
				bookingTime: data.bookingTime,
				specialRequirements: data.specialRequirements,
			};

			const utils = trpc.useUtils();
			return await utils.bookings.createPackageBooking.mutate(bookingData);
		},
		onSuccess: () => {
			toast.success("Booking created successfully!", {
				description: "You will receive a confirmation email shortly.",
			});
			form.reset();
			setDate(undefined);
			queryClient.invalidateQueries();
		},
		onError: (error: any) => {
			toast.error("Failed to create booking", {
				description: error.message || "Please try again later",
			});
		},
	});

	const onSubmit = (data: GuestBookingFormData) => {
		createBookingMutation.mutate(data);
	};

	// Calculate minimum booking date based on advance booking requirement
	const minDate = new Date();
	if (service.advanceBookingRequired) {
		minDate.setDate(minDate.getDate() + service.advanceBookingRequired);
	}

	const timeSlots = [
		"06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
		"12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
		"18:00", "19:00", "20:00", "21:00", "22:00"
	];

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
				<h3 className="font-semibold">Booking Details</h3>

				<div>
					<label className="block text-sm font-medium mb-1">Number of Passengers</label>
					<Input
						type="number"
						min={1}
						max={service.maxPassengers || 8}
						{...form.register("passengerCount", { valueAsNumber: true })}
						error={form.formState.errors.passengerCount?.message}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Booking Date</label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal",
									!date && "text-muted-foreground"
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{date ? format(date, "PPP") : "Pick a date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={date}
								onSelect={(selectedDate) => {
									setDate(selectedDate);
									if (selectedDate) {
										form.setValue("bookingDate", selectedDate);
									}
								}}
								disabled={(date) => isBefore(startOfDay(date), startOfDay(minDate))}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
					{form.formState.errors.bookingDate && (
						<p className="text-sm text-red-600 mt-1">
							{form.formState.errors.bookingDate.message}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Preferred Time</label>
					<select
						{...form.register("bookingTime")}
						className="w-full p-2 border rounded-md"
					>
						<option value="">Select a time</option>
						{timeSlots.map((time) => (
							<option key={time} value={time}>
								{time}
							</option>
						))}
					</select>
					{form.formState.errors.bookingTime && (
						<p className="text-sm text-red-600 mt-1">
							{form.formState.errors.bookingTime.message}
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
					<span className="font-semibold">Total Price:</span>
					<span className="text-2xl font-bold text-green-600">
						${service.price}
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
					"Book Service"
				)}
			</Button>

			<p className="text-xs text-gray-500 text-center">
				By booking, you agree to our terms of service and privacy policy.
			</p>
		</form>
	);
}