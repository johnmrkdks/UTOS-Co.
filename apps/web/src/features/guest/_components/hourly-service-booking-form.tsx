import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { addHours, format } from "date-fns";
import {
	ArrowLeft,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Loader2,
	MapPin,
	Package,
	Plus,
	Users,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/date-time-picker";
import { useCustomerProfileQuery } from "@/features/auth/_hooks/query/use-customer-profile-query";
import { useCreatePackageBookingMutation } from "@/features/customer/_hooks/query/use-create-package-booking-mutation";
import { useGetPublishedCarHourlyRateQuery } from "@/features/customer/_hooks/query/use-get-published-car-hourly-rate-query";
import {
	createServiceBookingSchema,
	type ServiceBookingFormData,
} from "@/features/guest/_schemas/service-booking-schema";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { createLocalDateForBackend } from "@/utils/timezone";

export type HourlyRoutePrefill = {
	originAddress?: string;
	destinationAddress?: string;
	pickupDate?: string;
	pickupTime?: string;
	stopAddresses?: string[];
	/** When set, hourly rate comes from pricing config for this published car */
	carId?: string;
};

interface HourlyServiceBookingFormProps {
	service: {
		id: string;
		name: string;
		hourlyRate: number;
		maxPassengers?: number;
		description?: string;
		bannerImageUrl?: string;
		features?: string[];
	};
	/** When coming from instant quote (hourly path) */
	routePrefill?: HourlyRoutePrefill;
}

export function HourlyServiceBookingForm({
	service,
	routePrefill,
}: HourlyServiceBookingFormProps) {
	const [step, setStep] = useState<"form" | "confirmation">("form");
	const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
	const [pickupLocation, setPickupLocation] = useState("");
	const [destination, setDestination] = useState("");
	const [stops, setStops] = useState<string[]>([]);
	const [hours, setHours] = useState<number>(2);
	const [selectedDate, setSelectedDate] = useState<Date>();
	const [selectedTime, setSelectedTime] = useState<string>();

	const navigate = useNavigate();
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	const { data: profileData, isLoading: profileLoading } =
		useCustomerProfileQuery();
	const createBookingMutation = useCreatePackageBookingMutation();
	const { data: pricingHourly } = useGetPublishedCarHourlyRateQuery(
		routePrefill?.carId,
	);

	const serviceForQuote = useMemo(() => {
		const fromConfig = pricingHourly?.hourlyRate;
		if (typeof fromConfig === "number" && fromConfig > 0) {
			return { ...service, hourlyRate: fromConfig };
		}
		return service;
	}, [service, pricingHourly?.hourlyRate]);

	useEffect(() => {
		if (!routePrefill) return;
		if (routePrefill.originAddress?.trim()) {
			setPickupLocation(routePrefill.originAddress);
		}
		if (routePrefill.destinationAddress?.trim()) {
			setDestination(routePrefill.destinationAddress);
		}
		if (routePrefill.pickupDate && routePrefill.pickupTime) {
			const d = new Date(`${routePrefill.pickupDate}T12:00:00`);
			if (!Number.isNaN(d.getTime())) {
				setSelectedDate(d);
			}
			setSelectedTime(routePrefill.pickupTime);
		}
		if (routePrefill.stopAddresses && routePrefill.stopAddresses.length > 0) {
			setStops(routePrefill.stopAddresses);
		}
	}, [routePrefill]);

	// Create schema for hourly service - ensure minimum 20 passengers
	const maxPassengers = Math.max(service.maxPassengers || 20, 20);
	const schema = createServiceBookingSchema(maxPassengers, true);

	const form = useForm<ServiceBookingFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			customerName: "",
			customerEmail: "",
			customerPhone: "",
			passengerCount: 1,
			luggageCount: 0,
			scheduledPickupTime: undefined,
			bookingDate: undefined,
			bookingTime: "",
			serviceDuration: 2,
			specialRequirements: "",
		},
	});

	// Calculate total cost: Hours * rate = total (never negative)
	const totalCost = useMemo(() => {
		return Math.max(0, hours * serviceForQuote.hourlyRate);
	}, [hours, serviceForQuote.hourlyRate]);

	// Pre-populate with user data if authenticated
	useEffect(() => {
		if (sessionData && profileData?.user) {
			const currentValues = form.getValues();
			form.reset({
				...currentValues,
				customerName: currentValues.customerName || profileData.user.name || "",
				customerEmail:
					currentValues.customerEmail || profileData.user.email || "",
				customerPhone:
					currentValues.customerPhone || profileData.user.phone || "",
			});
		}
	}, [sessionData, profileData, form]);

	// Update form hours when local hours state changes
	useEffect(() => {
		form.setValue("serviceDuration", hours);
	}, [hours, form]);

	// Update form date when local date/time state changes
	useEffect(() => {
		if (selectedDate && selectedTime) {
			// Combine date and time into a single Date object
			const [hours, minutes] = selectedTime.split(":").map(Number);
			const combinedDateTime = new Date(selectedDate);
			combinedDateTime.setHours(hours, minutes, 0, 0);
			form.setValue("scheduledPickupTime", combinedDateTime);
			form.setValue("bookingDate", selectedDate);
			form.setValue("bookingTime", selectedTime);
		}
	}, [selectedDate, selectedTime, form]);

	// Trigger form validation when key fields change
	useEffect(() => {
		if (pickupLocation && destination && selectedDate && selectedTime) {
			form.trigger(); // This will re-validate the entire form
		}
	}, [pickupLocation, destination, selectedDate, selectedTime, form]);

	const addStop = () => {
		if (stops.length < 5) {
			setStops([...stops, ""]);
		}
	};

	const removeStop = (index: number) => {
		setStops(stops.filter((_, i) => i !== index));
	};

	const updateStop = (index: number, value: string) => {
		const newStops = [...stops];
		newStops[index] = value;
		setStops(newStops);
	};

	const onSubmit = async (data: ServiceBookingFormData) => {
		// Guest booking allowed - no sign-in required
		try {
			console.log("🔍 FRONTEND DEBUG - Form Data Received:", data);
			console.log("🔍 FRONTEND DEBUG - Service:", service);
			console.log("🔍 FRONTEND DEBUG - Session:", sessionData);
			console.log("🔍 FRONTEND DEBUG - Pickup Location:", pickupLocation);
			console.log("🔍 FRONTEND DEBUG - Destination:", destination);
			console.log("🔍 FRONTEND DEBUG - Stops:", stops);
			console.log("🔍 FRONTEND DEBUG - Hours:", hours);
			console.log("🔍 FRONTEND DEBUG - Total Cost:", totalCost);

			// Create booking data
			const bookingData = {
				packageId: service.id,
				carId: routePrefill?.carId?.trim() || null,
				originAddress: pickupLocation,
				destinationAddress: destination,
				scheduledPickupTime: createLocalDateForBackend(
					format(data.scheduledPickupTime, "yyyy-MM-dd"),
					format(data.scheduledPickupTime, "HH:mm"),
				),
				customerName: data.customerName,
				customerPhone: data.customerPhone,
				customerEmail: data.customerEmail,
				passengerCount: data.passengerCount,
				serviceDuration: data.serviceDuration,
				specialRequests: data.specialRequirements || "",
				requirePayment: true, // Payment required before confirmation - same as guest/client flow
				stops:
					stops.length > 0
						? stops.map((stop, index) => ({
								address: stop,
								stopOrder: index + 1,
								waitingTime: 0,
								notes: "",
							}))
						: undefined,
			};

			const result = await createBookingMutation.mutateAsync(bookingData);
			// Redirect to payment page - booking confirmed + email sent after payment authorized
			if (result?.shareToken) {
				navigate({ to: "/pay/$token", params: { token: result.shareToken } });
				return;
			}
			setConfirmedBooking(result);
			setStep("confirmation");

			// Scroll to top after booking confirmation
			setTimeout(() => {
				window.scrollTo({ top: 0, behavior: "smooth" });
			}, 100);

			toast.success("Booking confirmed successfully!");
		} catch (error) {
			console.error("💥 FRONTEND DEBUG - Booking error:", error);
			console.error(
				"💥 FRONTEND DEBUG - Error details:",
				JSON.stringify(error, null, 2),
			);
			if (error instanceof Error) {
				console.error("💥 FRONTEND DEBUG - Error message:", error.message);
				console.error("💥 FRONTEND DEBUG - Error stack:", error.stack);
			}
			toast.error("Failed to create booking. Please try again.");
		}
	};

	if (step === "confirmation" && confirmedBooking) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="mx-auto max-w-3xl">
					<div className="mb-8 flex items-center gap-4">
						<CheckCircle className="mx-auto h-16 w-16 text-green-500" />
						<div>
							<h1 className="font-bold text-3xl text-gray-900">
								Booking Confirmed!
							</h1>
							<p className="text-gray-600">
								Your hourly service booking has been submitted successfully
							</p>
							{!sessionData && (
								<p className="mt-2 text-blue-600 text-sm">
									💡 Tip: Create an account to easily manage your bookings
								</p>
							)}
						</div>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Booking Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<h4 className="font-medium">{service.name}</h4>
								<p className="text-gray-600 text-sm">
									Hourly chauffeur service
								</p>
							</div>
							<Separator />

							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-600">Duration:</span>
									<span className="ml-2 font-medium">{hours} hours</span>
								</div>
								<div>
									<span className="text-gray-600">Total Cost:</span>
									<span className="ml-2 font-medium">
										${totalCost.toFixed(2)}
									</span>
								</div>
								<div className="col-span-2">
									<span className="text-gray-600">Pickup:</span>
									<span className="ml-2 font-medium">
										{selectedDate && selectedTime
											? (() => {
													const [hours, minutes] = selectedTime
														.split(":")
														.map(Number);
													const combinedDateTime = new Date(selectedDate);
													combinedDateTime.setHours(hours, minutes, 0, 0);
													return format(combinedDateTime, "PPP 'at' p");
												})()
											: "Not set"}
									</span>
								</div>
								{pickupLocation && (
									<div className="col-span-2">
										<span className="text-gray-600">From:</span>
										<span className="ml-2 font-medium">{pickupLocation}</span>
									</div>
								)}
								{destination && (
									<div className="col-span-2">
										<span className="text-gray-600">To:</span>
										<span className="ml-2 font-medium">{destination}</span>
									</div>
								)}
							</div>

							<Separator />
							<div className="flex flex-wrap gap-3">
								<Button
									onClick={() => navigate({ to: "/services" })}
									variant="outline"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Services
								</Button>
								{sessionData ? (
									<Button
										onClick={() => navigate({ to: "/my-bookings/trips" })}
									>
										View My Bookings
									</Button>
								) : (
									<Button
										onClick={() => navigate({ to: "/sign-in" })}
										variant="outline"
									>
										Sign in to manage bookings
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="mx-auto max-w-6xl px-4 py-8">
				<div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
					{/* Service Information Panel - Left Side */}
					<div className="xl:col-span-2">
						<div className="sticky top-8">
							<div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
								{/* Service Header */}
								<div className="relative flex h-64 items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5">
									{service.bannerImageUrl ? (
										<img
											src={service.bannerImageUrl}
											alt={service.name}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="text-center">
											<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
												<Clock className="h-10 w-10 text-primary/60" />
											</div>
											<h2 className="mb-2 font-bold text-2xl text-gray-800">
												{service.name}
											</h2>
											<p className="px-4 text-gray-600 text-sm">
												{service.description ||
													"Premium hourly chauffeur service"}
											</p>
										</div>
									)}
								</div>

								<div className="p-8">
									{/* Price Display */}
									<div className="mb-8 text-center">
										<div className="inline-flex items-baseline gap-2 rounded-xl border border-primary/20 bg-primary/10 px-6 py-4">
											<span className="font-black text-4xl text-primary">
												${totalCost.toFixed(2)}
											</span>
											<span className="font-medium text-primary/80 text-sm">
												total cost
											</span>
										</div>
										<div className="mt-3">
											<Badge variant="secondary">Hourly Service</Badge>
										</div>
									</div>

									{/* Service Details */}
									<div className="space-y-4">
										<h3 className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
											<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
												<Clock className="h-3 w-3 text-primary" />
											</div>
											Service Details
										</h3>

										<div className="space-y-3">
											<div className="flex items-center justify-between border-gray-100 border-b py-2">
												<span className="text-gray-600 text-sm">
													Hourly Rate
												</span>
												<span className="font-semibold">
													${serviceForQuote.hourlyRate.toFixed(2)}/hour
												</span>
											</div>
											<div className="flex items-center justify-between border-gray-100 border-b py-2">
												<span className="text-gray-600 text-sm">
													Duration Selected
												</span>
												<span className="font-semibold">{hours} hours</span>
											</div>
											<div className="flex items-center justify-between border-gray-100 border-b py-2">
												<span className="text-gray-600 text-sm">
													Calculation
												</span>
												<span className="font-semibold">
													{hours} × ${serviceForQuote.hourlyRate.toFixed(2)}
												</span>
											</div>
										</div>
									</div>

									{/* Features */}
									{service.features && service.features.length > 0 && (
										<div className="mt-6">
											<h4 className="mb-3 font-semibold text-gray-900 text-sm">
												Included Features
											</h4>
											<div className="grid grid-cols-1 gap-2">
												{service.features.slice(0, 4).map((feature, index) => (
													<div
														key={index}
														className="flex items-center gap-2 text-gray-600 text-sm"
													>
														<CheckCircle className="h-4 w-4 text-green-500" />
														<span>{feature}</span>
													</div>
												))}
											</div>
										</div>
									)}

									{/* Payment Information */}
									<div className="mt-8 rounded-lg bg-blue-50 p-4">
										<div className="flex gap-3">
											<div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
												<span className="text-primary text-sm">ℹ️</span>
											</div>
											<div>
												<p className="mb-2 font-semibold text-gray-800 text-sm">
													Payment Information
												</p>
												<ul className="space-y-1 text-gray-600 text-sm">
													<li>
														• Authorize payment now to confirm your booking
													</li>
													<li>• Card charged after service completion</li>
													<li>• Secure payment via Square</li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Booking Form - Right Side */}
					<div className="xl:col-span-3">
						<div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
							<div className="bg-primary p-8">
								<h1 className="mb-2 font-bold text-3xl text-white">
									Book Your Hourly Service
								</h1>
								<p className="text-primary-foreground/90">
									Complete your hourly service booking in just a few steps
								</p>
							</div>

							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8 p-8"
							>
								{/* Service Configuration */}
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
											<span className="font-bold text-lg text-white">1</span>
										</div>
										<div>
											<h3 className="font-bold text-gray-900 text-xl">
												Service Configuration
											</h3>
											<p className="text-gray-500 text-sm">
												Set your hourly service preferences
											</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										<div className="grid gap-5 md:grid-cols-2">
											{/* Hours Selection */}
											<div className="space-y-3">
												<Label className="flex items-center gap-2 font-semibold text-base">
													<Clock className="h-4 w-4" />
													Hours (Minimum 2hrs) *
												</Label>
												<div className="flex items-center gap-3">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => setHours(Math.max(2, hours - 1))}
														disabled={hours <= 2}
													>
														-
													</Button>
													<Input
														type="number"
														min="2"
														max="24"
														value={hours}
														onChange={(e) =>
															setHours(
																Math.max(
																	2,
																	Number.parseInt(e.target.value) || 2,
																),
															)
														}
														className="w-20 text-center"
													/>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => setHours(Math.min(24, hours + 1))}
														disabled={hours >= 24}
													>
														+
													</Button>
													<span className="text-gray-600 text-sm">hours</span>
												</div>
												<p className="text-gray-500 text-sm">
													Rate: ${serviceForQuote.hourlyRate.toFixed(2)}/hour
												</p>
											</div>

											{/* Number of Passengers */}
											<div className="space-y-3">
												<Label className="flex items-center gap-2 font-semibold text-base">
													<Users className="h-4 w-4" />
													Number of Passengers *
												</Label>
												<Input
													type="number"
													min="1"
													max={maxPassengers}
													{...form.register("passengerCount", {
														valueAsNumber: true,
													})}
													className="w-full"
												/>
												{form.formState.errors.passengerCount && (
													<p className="text-red-600 text-sm">
														{form.formState.errors.passengerCount.message}
													</p>
												)}
											</div>
										</div>
									</div>
								</div>

								<Separator />

								{/* Journey Details */}
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
											<span className="font-bold text-lg text-white">2</span>
										</div>
										<div>
											<h3 className="font-bold text-gray-900 text-xl">
												Journey Details
											</h3>
											<p className="text-gray-500 text-sm">
												Set your pickup and destination
											</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										{/* Pickup Location */}
										<div className="space-y-3">
											<Label className="font-semibold text-base">
												Pickup Location (Origin) *
											</Label>
											<GooglePlacesInput
												value={pickupLocation}
												onChange={setPickupLocation}
												placeholder="Enter pickup address..."
												className="h-12 w-full"
											/>
										</div>

										{/* Destination */}
										<div className="space-y-3">
											<Label className="font-semibold text-base">
												Destination *
											</Label>
											<GooglePlacesInput
												value={destination}
												onChange={setDestination}
												placeholder="Enter destination address..."
												className="h-12 w-full"
											/>
										</div>

										{/* Stops */}
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<Label className="font-semibold text-base">
													Additional Stops (Optional)
												</Label>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={addStop}
													disabled={stops.length >= 5}
													className="text-sm"
												>
													<Plus className="mr-1 h-4 w-4" />
													Add Stop
												</Button>
											</div>
											{stops.map((stop, index) => (
												<div key={index} className="flex gap-3">
													<GooglePlacesInput
														value={stop}
														onChange={(value) => updateStop(index, value)}
														placeholder={`Stop ${index + 1} address...`}
														className="h-12 flex-1"
													/>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => removeStop(index)}
														className="px-3"
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
											))}
											{stops.length === 0 && (
												<p className="text-gray-500 text-sm italic">
													No additional stops added
												</p>
											)}
										</div>
									</div>
								</div>

								<Separator />

								{/* Contact Information */}
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
											<span className="font-bold text-lg text-white">3</span>
										</div>
										<div>
											<h3 className="font-bold text-gray-900 text-xl">
												Contact Information
											</h3>
											<p className="text-gray-500 text-sm">
												Your details for booking confirmation
											</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										<div className="grid gap-4 md:grid-cols-2">
											<div className="space-y-3">
												<Label className="font-semibold text-base">
													Full Name *
												</Label>
												<Input
													{...form.register("customerName")}
													placeholder="Your full name"
													className="h-12"
												/>
												{form.formState.errors.customerName && (
													<p className="text-red-600 text-sm">
														{form.formState.errors.customerName.message}
													</p>
												)}
											</div>

											<div className="space-y-3">
												<Label className="font-semibold text-base">
													Phone Number *
												</Label>
												<Input
													type="tel"
													{...form.register("customerPhone")}
													placeholder="+1 (555) 123-4567"
													className="h-12"
												/>
												{form.formState.errors.customerPhone && (
													<p className="text-red-600 text-sm">
														{form.formState.errors.customerPhone.message}
													</p>
												)}
											</div>
										</div>

										<div className="space-y-3">
											<Label className="font-semibold text-base">
												Email Address *
											</Label>
											<Input
												type="email"
												{...form.register("customerEmail")}
												placeholder="your.email@example.com"
												className="h-12"
											/>
											{form.formState.errors.customerEmail && (
												<p className="text-red-600 text-sm">
													{form.formState.errors.customerEmail.message}
												</p>
											)}
										</div>
									</div>
								</div>

								<Separator />

								{/* Booking Details */}
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
											<span className="font-bold text-lg text-white">4</span>
										</div>
										<div>
											<h3 className="font-bold text-gray-900 text-xl">
												Booking Details
											</h3>
											<p className="text-gray-500 text-sm">
												Choose your pickup date and time
											</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										{/* Pickup Date and Time */}
										<div className="space-y-3">
											<Label className="flex items-center gap-2 font-semibold text-base">
												<Calendar className="h-4 w-4" />
												Pickup Date and Time *
											</Label>
											<DateTimePicker
												selectedDate={selectedDate}
												selectedTime={selectedTime}
												onDateChange={setSelectedDate}
												onTimeChange={setSelectedTime}
												dateLabel="Pickup Date *"
												timeLabel="Pickup Time *"
												className="w-full"
											/>
											<p className="text-gray-500 text-sm">
												Must be at least 24 hours from now
											</p>
										</div>

										{/* Additional Notes */}
										<div className="space-y-3">
											<Label className="font-semibold text-base">
												Additional Notes (Optional)
											</Label>
											<Textarea
												{...form.register("specialRequirements")}
												placeholder="Any special requirements or notes for your booking..."
												rows={4}
												className="resize-none"
											/>
										</div>
									</div>
								</div>

								{/* Submit Button */}
								<div className="flex justify-end pt-4">
									<Button
										type="submit"
										size="lg"
										disabled={
											createBookingMutation.isPending ||
											profileLoading ||
											!pickupLocation ||
											!destination ||
											!selectedDate ||
											!selectedTime
										}
										className="h-14 w-full font-bold text-lg"
									>
										{createBookingMutation.isPending ? (
											<>
												<Loader2 className="mr-2 h-5 w-5 animate-spin" />
												Creating Booking...
											</>
										) : (
											<>
												<Package className="mr-2 h-5 w-5" />
												Complete Booking ${totalCost.toFixed(2)}
											</>
										)}
									</Button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
