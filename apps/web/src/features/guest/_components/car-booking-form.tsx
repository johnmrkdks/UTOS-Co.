import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCustomBookingMutation } from "@/features/customer/_hooks/query/use-create-custom-booking-mutation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, isBefore, startOfDay, differenceInDays } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";

const carBookingSchema = z.object({
	customerName: z.string().min(2, "Name must be at least 2 characters"),
	customerEmail: z.string().email("Please enter a valid email"),
	customerPhone: z.string().min(10, "Please enter a valid phone number"),
	startDate: z.date({
		message: "Please select a start date",
	}),
	endDate: z.date({
		message: "Please select an end date",
	}),
	pickupLocation: z.string().min(5, "Please specify pickup location"),
	dropoffLocation: z.string().min(5, "Please specify dropoff location"),
	specialRequirements: z.string().optional(),
}).refine((data) => data.endDate >= data.startDate, {
	message: "End date must be on or after start date",
	path: ["endDate"],
});

type CarBookingFormData = z.infer<typeof carBookingSchema>;

interface CarBookingFormProps {
	car: {
		id: string;
		brand?: { name: string };
		model?: { name: string };
		pricePerDay: number;
		year?: number;
	};
}

export function CarBookingForm({ car }: CarBookingFormProps) {
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();
	const createBookingMutation = useCreateCustomBookingMutation();

	const form = useForm<CarBookingFormData>({
		resolver: zodResolver(carBookingSchema),
		defaultValues: {
			customerName: "",
			customerEmail: "",
			customerPhone: "",
			pickupLocation: "",
			dropoffLocation: "",
			specialRequirements: "",
		},
	});


	const onSubmit = (data: CarBookingFormData) => {
		const bookingData = {
			carId: car.id,
			customerName: data.customerName,
			customerEmail: data.customerEmail,
			customerPhone: data.customerPhone,
			startDate: data.startDate,
			endDate: data.endDate,
			pickupLocation: data.pickupLocation,
			dropoffLocation: data.dropoffLocation,
			specialRequirements: data.specialRequirements,
			totalAmount: calculateTotalAmount(),
		};

		createBookingMutation.mutate(bookingData, {
			onSuccess: () => {
				form.reset();
				setStartDate(undefined);
				setEndDate(undefined);
			},
		});
	};

	const calculateTotalAmount = (): number => {
		if (!startDate || !endDate) return 0;
		const days = Math.max(1, differenceInDays(endDate, startDate) + 1);
		return days * car.pricePerDay;
	};

	const totalAmount = calculateTotalAmount();
	const days = startDate && endDate ? Math.max(1, differenceInDays(endDate, startDate) + 1) : 0;

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
				<h3 className="font-semibold">Booking Details</h3>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium mb-1">Start Date</label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"w-full justify-start text-left font-normal",
										!startDate && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{startDate ? format(startDate, "PPP") : "Pick start date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={startDate}
									onSelect={(selectedDate) => {
										setStartDate(selectedDate);
										if (selectedDate) {
											form.setValue("startDate", selectedDate);
											// Reset end date if it's before the new start date
											if (endDate && selectedDate > endDate) {
												setEndDate(undefined);
												form.setValue("endDate", selectedDate);
											}
										}
									}}
									disabled={(date) => isBefore(startOfDay(date), startOfDay(minDate))}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
						{form.formState.errors.startDate && (
							<p className="text-sm text-red-600 mt-1">
								{form.formState.errors.startDate.message}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">End Date</label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"w-full justify-start text-left font-normal",
										!endDate && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{endDate ? format(endDate, "PPP") : "Pick end date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={endDate}
									onSelect={(selectedDate) => {
										setEndDate(selectedDate);
										if (selectedDate) {
											form.setValue("endDate", selectedDate);
										}
									}}
									disabled={(date) => 
										isBefore(startOfDay(date), startOfDay(startDate || minDate))
									}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
						{form.formState.errors.endDate && (
							<p className="text-sm text-red-600 mt-1">
								{form.formState.errors.endDate.message}
							</p>
						)}
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Pickup Location</label>
					<Input
						{...form.register("pickupLocation")}
						placeholder="Enter pickup address"
						error={form.formState.errors.pickupLocation?.message}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Dropoff Location</label>
					<Input
						{...form.register("dropoffLocation")}
						placeholder="Enter dropoff address"
						error={form.formState.errors.dropoffLocation?.message}
					/>
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
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<span>Daily Rate:</span>
						<span>${car.pricePerDay}</span>
					</div>
					{days > 0 && (
						<div className="flex justify-between items-center">
							<span>Number of Days:</span>
							<span>{days} {days === 1 ? 'day' : 'days'}</span>
						</div>
					)}
					<div className="flex justify-between items-center font-semibold border-t pt-2">
						<span>Total Price:</span>
						<span className="text-xl text-green-600">
							${totalAmount.toFixed(2)}
						</span>
					</div>
				</div>
				<p className="text-xs text-gray-500 mt-2">
					Payment will be processed after booking confirmation. Online payment options available soon.
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
					"Book Car"
				)}
			</Button>

			<p className="text-xs text-gray-500 text-center">
				By booking, you agree to our terms of service and privacy policy.
			</p>
		</form>
	);
}