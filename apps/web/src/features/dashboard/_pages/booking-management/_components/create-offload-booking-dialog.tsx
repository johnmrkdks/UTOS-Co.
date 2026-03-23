import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
	LuggageIcon,
	PlusIcon,
	TruckIcon,
	UserIcon,
	UsersIcon,
	XIcon,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { DateTimePicker } from "@/components/date-time-picker";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import { useCreateOffloadBookingMutation } from "../_hooks/query/use-create-offload-booking-mutation";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import {
	type OffloadBookingFormData,
	offloadBookingSchema,
} from "../_schemas/offload-booking-schema";

export function CreateOffloadBookingDialog() {
	const { isCreateOffloadBookingDialogOpen, closeCreateOffloadBookingDialog } =
		useBookingManagementModalProvider();
	const createOffloadBookingMutation = useCreateOffloadBookingMutation();

	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedTime, setSelectedTime] = useState("");
	const [pickupAddress, setPickupAddress] = useState("");
	const [destinationAddress, setDestinationAddress] = useState("");
	const [stopsGeometry, setStopsGeometry] = useState<any[]>([]);

	const form = useForm<OffloadBookingFormData>({
		resolver: zodResolver(offloadBookingSchema),
		defaultValues: {
			offloaderName: "",
			jobType: "",
			pickupAddress: "",
			destinationAddress: "",
			stops: [],
			vehicleType: "",
			price: 0,
			scheduledPickupTime: new Date(),
			customerName: "",
			customerPhone: "",
			customerEmail: "",
			passengerCount: 1,
			luggageCount: 0,
			notes: "",
		},
	});

	const {
		fields: stopFields,
		append: appendStop,
		remove: removeStop,
	} = useFieldArray({
		control: form.control,
		name: "stops",
	});

	const watchedPrice = form.watch("price");
	const displayPrice =
		watchedPrice && !isNaN(watchedPrice) && watchedPrice > 0
			? watchedPrice
			: null;

	const onSubmit = async (data: OffloadBookingFormData) => {
		console.log(
			"📤 FRONTEND - Form data submitted:",
			JSON.stringify(data, null, 2),
		);

		// Convert form data to the format expected by the backend
		const bookingData = {
			// Main booking fields
			originAddress: data.pickupAddress,
			destinationAddress: data.destinationAddress,
			quotedAmount: data.price, // Store as dollar amount
			scheduledPickupTime: data.scheduledPickupTime.toISOString(),
			customerName: data.customerName,
			customerPhone: data.customerPhone,
			customerEmail: data.customerEmail || "",
			passengerCount: data.passengerCount || 1,
			luggageCount: data.luggageCount || 0,
			additionalNotes: data.notes || "",

			// Offload details (nested object)
			offloadDetails: {
				offloaderName: data.offloaderName,
				jobType: data.jobType,
				vehicleType: data.vehicleType,
			},

			// Stops array
			stops: data.stops.map((stop, index) => ({
				stopOrder: stop.stopOrder,
				address: stop.address,
				latitude: stop.latitude ?? null,
				longitude: stop.longitude ?? null,
				notes: stop.notes ?? "",
			})),
		};

		console.log(
			"📦 FRONTEND - Booking data prepared:",
			JSON.stringify(bookingData, null, 2),
		);

		try {
			console.log("🚀 FRONTEND - Calling mutateAsync...");
			await createOffloadBookingMutation.mutateAsync(bookingData);
			// Reset form and close dialog only on success
			form.reset();
			setSelectedDate(undefined);
			setSelectedTime("");
			setPickupAddress("");
			setDestinationAddress("");
			setStopsGeometry([]);
			closeCreateOffloadBookingDialog();
		} catch (error) {
			console.error("Failed to create offload booking:", error);
			// Dialog stays open on error so user can retry
		}
	};

	const handleClose = () => {
		form.reset();
		setSelectedDate(undefined);
		setSelectedTime("");
		setPickupAddress("");
		setDestinationAddress("");
		closeCreateOffloadBookingDialog();
	};

	const addStop = () => {
		const nextStopOrder = stopFields.length + 1;
		appendStop({
			stopOrder: nextStopOrder,
			address: "",
			latitude: null,
			longitude: null,
			notes: "",
		});
		setStopsGeometry((prev) => [...prev, null]);
	};

	const removeStopHandler = (index: number) => {
		removeStop(index);
		setStopsGeometry((prev) => prev.filter((_, i) => i !== index));

		// Update stopOrder for remaining stops
		const currentStops = form.getValues("stops");
		currentStops.forEach((stop, idx) => {
			form.setValue(`stops.${idx}.stopOrder`, idx + 1);
		});
	};

	const updateStopGeometry = (index: number, place: any) => {
		setStopsGeometry((prev) => {
			const updated = [...prev];
			updated[index] = place.geometry;
			return updated;
		});

		// Update latitude and longitude if available
		if (place.geometry?.location) {
			form.setValue(`stops.${index}.latitude`, place.geometry.location.lat());
			form.setValue(`stops.${index}.longitude`, place.geometry.location.lng());
		}
	};

	return (
		<Dialog open={isCreateOffloadBookingDialogOpen} onOpenChange={handleClose}>
			<DialogContent
				className="!max-w-6xl flex max-h-[90vh] flex-col overflow-hidden p-0"
				showCloseButton={false}
				onPointerDownOutside={(e) => {
					// Allow clicks on Google Places address dropdown (portaled to body)
					const target = e.target as Node;
					const dropdown = document.querySelector("[data-address-dropdown]");
					if (dropdown?.contains(target)) {
						e.preventDefault();
					}
				}}
			>
				<DialogHeader className="sticky top-0 z-10 border-b bg-background px-6 pt-6 pb-4">
					<DialogTitle className="flex items-center gap-2">
						<TruckIcon className="h-5 w-5 text-orange-600" />
						Create Offload Booking
					</DialogTitle>
					<DialogDescription>
						Add a manual booking from another company to help with workload
						distribution.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-1 flex-col overflow-hidden"
					>
						{/* Scrollable Content Area */}
						<div className="flex-1 overflow-y-auto px-6 py-6">
							{/* 2-Column Layout */}
							<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
								{/* Left Column - Booking Details */}
								<div className="space-y-4">
									<div className="border-b pb-2">
										<h3 className="flex items-center gap-2 font-medium text-gray-900 text-lg">
											<TruckIcon className="h-5 w-5 text-orange-600" />
											Booking Details
										</h3>
									</div>

									{/* Offloader Name */}
									<FormField
										control={form.control}
										name="offloaderName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Offloader Name *</FormLabel>
												<FormControl>
													<Input {...field} placeholder="Company name" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Job Type */}
									<FormField
										control={form.control}
										name="jobType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Job Type *</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="e.g., Airport Transfer, Corporate Event"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Pickup Address */}
									<FormField
										control={form.control}
										name="pickupAddress"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Pickup Address *</FormLabel>
												<FormControl>
													<GooglePlacesInput
														{...field}
														placeholder="Enter pickup location in NSW..."
														onPlaceSelect={(place) => {
															field.onChange(place.description);
															form.setValue("pickupAddress", place.description);
														}}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Destination Address */}
									<FormField
										control={form.control}
										name="destinationAddress"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Destination Address *</FormLabel>
												<FormControl>
													<GooglePlacesInput
														{...field}
														placeholder="Enter destination location in NSW..."
														onPlaceSelect={(place) => {
															field.onChange(place.description);
															form.setValue(
																"destinationAddress",
																place.description,
															);
														}}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Stops */}
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<Label className="font-semibold text-sm">
												Additional Stops (Optional)
											</Label>
											<span className="text-muted-foreground text-xs">
												{stopFields.length}/5
											</span>
										</div>

										{stopFields.map((field, index) => (
											<div
												key={field.id}
												className="space-y-2 rounded-lg border bg-muted/30 p-3"
											>
												<div className="mb-2 flex items-center justify-between">
													<span className="font-medium text-sm">
														Stop {index + 1}
													</span>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => removeStopHandler(index)}
													>
														<XIcon className="h-4 w-4" />
													</Button>
												</div>

												<div className="space-y-2">
													<Label className="text-xs">Address *</Label>
													<div className="rounded-md bg-white">
														<GooglePlacesInput
															value={form.watch(`stops.${index}.address`) || ""}
															onChange={(value) =>
																form.setValue(`stops.${index}.address`, value)
															}
															onPlaceSelect={(place) => {
																form.setValue(
																	`stops.${index}.address`,
																	place.description,
																);
																updateStopGeometry(index, place);
															}}
															placeholder={`Stop ${index + 1} address...`}
														/>
													</div>
													{form.formState.errors.stops?.[index]?.address && (
														<p className="text-red-500 text-xs">
															{
																form.formState.errors.stops[index]?.address
																	?.message
															}
														</p>
													)}
												</div>

												<div className="space-y-2">
													<Label className="text-xs">Notes (Optional)</Label>
													<Input
														className="bg-white"
														placeholder="Special instructions..."
														value={form.watch(`stops.${index}.notes`) || ""}
														onChange={(e) =>
															form.setValue(
																`stops.${index}.notes`,
																e.target.value,
															)
														}
													/>
												</div>
											</div>
										))}

										{/* Add Stop Button */}
										{stopFields.length < 5 && (
											<Button
												type="button"
												variant="outline"
												onClick={addStop}
												className="w-full"
											>
												<PlusIcon className="mr-2 h-4 w-4" />
												Add Stop
											</Button>
										)}
									</div>

									{/* Vehicle Type */}
									<FormField
										control={form.control}
										name="vehicleType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Vehicle Type *</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="e.g., Sedan, SUV, Van, Luxury Car"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Price */}
									<FormField
										control={form.control}
										name="price"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Price (AUD) *</FormLabel>
												<FormControl>
													<div className="relative">
														<span className="-translate-y-1/2 absolute top-1/2 left-3 transform text-gray-500">
															$
														</span>
														<Input
															{...field}
															type="number"
															step="0.01"
															placeholder="0.00"
															className="pl-7"
															onChange={(e) =>
																field.onChange(
																	Number.parseFloat(e.target.value) || 0,
																)
															}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Right Column - Customer Details & Schedule */}
								<div className="space-y-4">
									<div className="border-b pb-2">
										<h3 className="flex items-center gap-2 font-medium text-gray-900 text-lg">
											<UserIcon className="h-5 w-5 text-blue-600" />
											Customer Details
										</h3>
									</div>

									{/* Customer Name */}
									<FormField
										control={form.control}
										name="customerName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Customer Name *</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="Enter customer's full name"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Customer Phone */}
									<FormField
										control={form.control}
										name="customerPhone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Customer Phone *</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="Enter customer's phone number"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Customer Email */}
									<FormField
										control={form.control}
										name="customerEmail"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Customer Email (Optional)</FormLabel>
												<FormControl>
													<Input
														{...field}
														type="email"
														placeholder="customer@example.com"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Optional fields in a row */}
									<div className="grid grid-cols-2 gap-3">
										{/* Number of Passengers */}
										<FormField
											control={form.control}
											name="passengerCount"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Passengers (Optional)</FormLabel>
													<FormControl>
														<Input
															{...field}
															type="number"
															min="1"
															max="20"
															placeholder="e.g. 2"
															onChange={(e) =>
																field.onChange(
																	Number.parseInt(e.target.value) || 1,
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* Luggage Count */}
										<FormField
											control={form.control}
											name="luggageCount"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Luggage (Optional)</FormLabel>
													<FormControl>
														<Input
															{...field}
															type="number"
															min="0"
															max="50"
															placeholder="e.g. 3"
															onChange={(e) =>
																field.onChange(
																	Number.parseInt(e.target.value) || 0,
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{/* Scheduled Pickup Date & Time using DateTimePicker */}
									<FormField
										control={form.control}
										name="scheduledPickupTime"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Scheduled Pickup Date & Time *</FormLabel>
												<FormControl>
													<DateTimePicker
														{...field}
														selectedDate={selectedDate}
														selectedTime={selectedTime}
														onDateChange={(date) => {
															setSelectedDate(date);
															if (date && selectedTime) {
																const [hours, minutes] =
																	selectedTime.split(":");
																const dateTime = new Date(date);
																dateTime.setHours(
																	Number.parseInt(hours),
																	Number.parseInt(minutes),
																);
																form.setValue("scheduledPickupTime", dateTime);
															}
														}}
														onTimeChange={(time) => {
															setSelectedTime(time);
															if (selectedDate && time) {
																const [hours, minutes] = time.split(":");
																const dateTime = new Date(selectedDate);
																dateTime.setHours(
																	Number.parseInt(hours),
																	Number.parseInt(minutes),
																);
																form.setValue("scheduledPickupTime", dateTime);
															}
														}}
														dateError={
															form.formState.errors.scheduledPickupTime?.message
														}
														timeError={
															form.formState.errors.scheduledPickupTime?.message
														}
														allowPastDates={true}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Notes */}
									<FormField
										control={form.control}
										name="notes"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Notes (Optional)</FormLabel>
												<FormControl>
													<Textarea
														{...field}
														placeholder="Additional information or special requirements"
														rows={3}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Price Summary */}
									{displayPrice && (
										<div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
											<div className="flex items-center justify-between">
												<span className="font-medium text-orange-800 text-sm">
													Total Price:
												</span>
												<span className="font-bold text-lg text-orange-900">
													${displayPrice.toFixed(2)} AUD
												</span>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Action Buttons - Sticky Footer */}
						<div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t bg-background px-6 py-4">
							<Button
								type="button"
								variant="outline"
								onClick={handleClose}
								disabled={form.formState.isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting
									? "Creating..."
									: "Create Offload Booking"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
