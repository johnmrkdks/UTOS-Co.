// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { useCreatePackageBookingMutation } from "../_hooks/query/use-create-package-booking-mutation";
import { useGetPackagesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-packages-query";
import { useGetCarsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-get-cars-query";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarIcon, MapPin, Plus, Trash2, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { DateTimePicker } from "@/components/date-time-picker";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";

const createPackageBookingSchema = (isHourlyPackage = false) => z.object({
	packageId: z.string().min(1, "Please select a package"),
	carId: z.string().min(1, "Please select a car"),
	userId: z.string().min(1, "User ID is required"),

	// Location fields
	originAddress: z.string().min(1, "Pickup address is required"),
	destinationAddress: isHourlyPackage
		? z.string().optional()
		: z.string().min(1, "Destination address is required"),

	// Hours field for hourly packages
	serviceDurationHours: isHourlyPackage
		? z.number().min(2, "Minimum 2 hours required").max(24, "Maximum 24 hours allowed")
		: z.number().optional(),

	// Stops for hourly packages
	stops: z.array(z.object({
		address: z.string().min(1, "Stop address is required"),
	})).optional(),

	// Date and time
	scheduledPickupTime: z.date({
		message: "Pickup time is required",
	}),

	// Customer details
	customerName: z.string().min(1, "Customer name is required"),
	customerPhone: z.string().min(1, "Customer phone is required"),
	customerEmail: z.string().email().optional().or(z.literal("")),
	passengerCount: z.number().int().min(1).max(8).default(1),
	specialRequests: z.string().optional(),
});

type CreatePackageBookingForm = z.infer<ReturnType<typeof createPackageBookingSchema>>;

export function CreatePackageBookingDialog() {
	const {
		isCreatePackageBookingDialogOpen,
		closeCreatePackageBookingDialog
	} = useBookingManagementModalProvider();

	// State for managing addresses, stops, and package details
	const [originAddress, setOriginAddress] = useState("");
	const [destinationAddress, setDestinationAddress] = useState("");
	const [stops, setStops] = useState<Array<{ address: string }>>([]);
	const [selectedPackage, setSelectedPackage] = useState<any>(null);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedTime, setSelectedTime] = useState("");
	const [calculatedTotal, setCalculatedTotal] = useState<number>(0);

	// Determine if selected package is hourly
	const isHourlyPackage = selectedPackage?.serviceType?.rateType === "hourly";

	const form = useForm<CreatePackageBookingForm>({
		resolver: zodResolver(createPackageBookingSchema(isHourlyPackage)),
		defaultValues: {
			passengerCount: 1,
			customerEmail: "",
			specialRequests: "",
			stops: [],
			serviceDurationHours: isHourlyPackage ? 2 : undefined,
		},
	});

	// Watch for changes to calculate total for hourly packages
	const watchedHours = form.watch("serviceDurationHours");

	// Calculate total for hourly packages
	useEffect(() => {
		if (isHourlyPackage && selectedPackage && watchedHours) {
			const hourlyRate = selectedPackage.hourlyRate || 0;
			const total = watchedHours * hourlyRate;
			setCalculatedTotal(total);
		}
	}, [isHourlyPackage, selectedPackage, watchedHours]);

	// Handle package selection
	const handlePackageChange = (packageId: string) => {
		const pkg = packagesQuery.data?.data?.find((p: any) => p.id === packageId);
		setSelectedPackage(pkg);
		form.setValue("packageId", packageId);
	};

	// Handle stops management
	const addStop = () => {
		const newStops = [...stops, { address: "" }];
		setStops(newStops);
		form.setValue("stops", newStops);
	};

	const removeStop = (index: number) => {
		const newStops = stops.filter((_, i) => i !== index);
		setStops(newStops);
		form.setValue("stops", newStops);
	};

	const updateStop = (index: number, address: string) => {
		const newStops = [...stops];
		newStops[index] = { address };
		setStops(newStops);
		form.setValue("stops", newStops);
	};

	// Fetch data for dropdowns
	const packagesQuery = useGetPackagesQuery({
		limit: 100,
	});

	const carsQuery = useGetCarsQuery({
		limit: 100,
	});

	const createPackageBookingMutation = useCreatePackageBookingMutation(() => {
		// Reset all state on successful booking creation
		form.reset();
		setOriginAddress("");
		setDestinationAddress("");
		setStops([]);
		setSelectedPackage(null);
		setSelectedDate(null);
		setSelectedTime("");
		setCalculatedTotal(0);
		closeCreatePackageBookingDialog();
	});

	const onSubmit = (data: CreatePackageBookingForm) => {
		// Prepare submission data based on package type
		const submissionData = {
			...data,
			// For hourly packages, include calculated total if available
			...(isHourlyPackage && calculatedTotal > 0 && {
				calculatedTotal: calculatedTotal // Store calculated total for reference
			}),
			// Ensure stops are properly formatted
			stops: stops.filter(stop => stop.address.trim() !== ""),
		};

		createPackageBookingMutation.mutate(submissionData as any);
	};

	const handleClose = () => {
		if (!createPackageBookingMutation.isPending) {
			// Reset all form state
			form.reset();
			// Reset component state
			setOriginAddress("");
			setDestinationAddress("");
			setStops([]);
			setSelectedPackage(null);
			setSelectedDate(null);
			setSelectedTime("");
			setCalculatedTotal(0);
			// Close dialog
			closeCreatePackageBookingDialog();
		}
	};

	return (
		<Dialog open={isCreatePackageBookingDialogOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Package Booking (Admin)</DialogTitle>
					<DialogDescription>
						Manually create a new package booking on behalf of a customer. This booking will use predefined package pricing and services.
					</DialogDescription>
				</DialogHeader>

				<Form {...form as any}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control as any}
								name="packageId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Package</FormLabel>
										<Select onValueChange={handlePackageChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a package" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{packagesQuery.data?.data?.map((pkg: any) => {
													const isHourly = pkg.serviceType?.rateType === "hourly";
													const priceDisplay = isHourly
														? `$${(pkg.hourlyRate / 100).toFixed(2)}/hour`
														: `$${(pkg.fixedPrice / 100).toFixed(2)}`;
													return (
														<SelectItem key={pkg.id} value={pkg.id}>
															{pkg.name} - {priceDisplay}
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control as any}
								name="carId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Vehicle</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a vehicle" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{carsQuery.data?.data?.map((car: any) => (
													<SelectItem key={car.id} value={car.id}>
														{car.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control as any}
								name="customerName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Customer Name</FormLabel>
										<FormControl>
											<Input placeholder="John Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control as any}
								name="customerPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Customer Phone</FormLabel>
										<FormControl>
											<Input placeholder="+1 (555) 123-4567" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control as any}
							name="customerEmail"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Customer Email (Optional)</FormLabel>
									<FormControl>
										<Input placeholder="john@example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Hours field for hourly packages */}
						{isHourlyPackage && (
							<FormField
								control={form.control as any}
								name="serviceDurationHours"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<Clock className="h-4 w-4" />
											Service Duration (Hours) *
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="2"
												max="24"
												placeholder="Minimum 2 hours"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormDescription>
											Minimum 2 hours, maximum 24 hours
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Location fields */}
						<div className="space-y-4">
							<FormField
								control={form.control as any}
								name="originAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pickup Address *</FormLabel>
										<FormControl>
											<GooglePlacesInput
												value={originAddress}
												onChange={(value) => {
													setOriginAddress(value);
													field.onChange(value);
												}}
												placeholder="Enter pickup location in NSW..."
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Destination address - optional for hourly packages */}
							<FormField
								control={form.control as any}
								name="destinationAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Destination Address {isHourlyPackage ? "(Optional)" : "*"}
										</FormLabel>
										<FormControl>
											<GooglePlacesInput
												value={destinationAddress}
												onChange={(value) => {
													setDestinationAddress(value);
													field.onChange(value);
												}}
												placeholder={isHourlyPackage ? "Optional final destination..." : "Enter destination location in NSW..."}
											/>
										</FormControl>
										{isHourlyPackage && (
											<FormDescription>
												For hourly services, you can specify the final destination or leave empty if undefined
											</FormDescription>
										)}
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Stops section - primarily for hourly packages */}
							{isHourlyPackage && (
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<FormLabel className="flex items-center gap-2">
											<MapPin className="h-4 w-4" />
											Stops (Optional)
										</FormLabel>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={addStop}
											className="h-8 px-3"
										>
											<Plus className="h-3 w-3 mr-1" />
											Add Stop
										</Button>
									</div>

									{stops.map((stop, index) => (
										<div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
											<div className="flex-1">
												<GooglePlacesInput
													value={stop.address}
													onChange={(value) => updateStop(index, value)}
													placeholder={`Stop ${index + 1} address...`}
												/>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeStop(index)}
												className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									))}

									{stops.length === 0 && (
										<p className="text-sm text-muted-foreground text-center py-4 bg-gray-50 rounded-lg">
											No stops added. Click "Add Stop" to include intermediate destinations.
										</p>
									)}
								</div>
							)}
						</div>

						{/* Date and Time Picker */}
						<div className="space-y-2">
							<FormLabel>Pickup Date & Time *</FormLabel>
							<DateTimePicker
								selectedDate={selectedDate}
								selectedTime={selectedTime}
								onDateChange={(date) => {
									setSelectedDate(date);
									if (date && selectedTime) {
										const [hours, minutes] = selectedTime.split(':');
										const dateTime = new Date(date);
										dateTime.setHours(parseInt(hours), parseInt(minutes));
										form.setValue("scheduledPickupTime", dateTime);
									}
								}}
								onTimeChange={(time) => {
									setSelectedTime(time);
									if (selectedDate && time) {
										const [hours, minutes] = time.split(':');
										const dateTime = new Date(selectedDate);
										dateTime.setHours(parseInt(hours), parseInt(minutes));
										form.setValue("scheduledPickupTime", dateTime);
									}
								}}
							/>
						</div>

						{/* Number of Passengers */}
						<FormField
							control={form.control as any}
							name="passengerCount"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-2">
										<Users className="h-4 w-4" />
										Number of Passengers
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="1"
											max="8"
											placeholder="e.g. 2"
											{...field}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Pricing Summary for Hourly Packages */}
						{isHourlyPackage && selectedPackage && watchedHours && watchedHours >= 2 && (
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<h4 className="font-medium text-blue-900 mb-2">Pricing Calculation</h4>
								<div className="space-y-1 text-sm text-blue-800">
									<div className="flex justify-between">
										<span>Hourly Rate:</span>
										<span>${((selectedPackage.hourlyRate || 0) / 100).toFixed(2)}/hour</span>
									</div>
									<div className="flex justify-between">
										<span>Duration:</span>
										<span>{watchedHours} hours</span>
									</div>
									<div className="border-t border-blue-300 pt-1 mt-2">
										<div className="flex justify-between font-semibold">
											<span>Total:</span>
											<span>${(calculatedTotal / 100).toFixed(2)}</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Additional Notes */}
						<FormField
							control={form.control as any}
							name="specialRequests"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Additional Notes (Optional)</FormLabel>
									<FormControl>
										<Textarea
											rows={3}
											placeholder="Any special requests, meeting details, or additional information..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={handleClose}
								disabled={createPackageBookingMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={createPackageBookingMutation.isPending}
							>
								{createPackageBookingMutation.isPending ? "Creating..." : "Create Booking"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
