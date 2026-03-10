import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { format, addHours } from "date-fns";
import { Loader2, CheckCircle, Calendar, Clock, Users, MapPin, Plus, X, Package, DollarSign, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Label } from "@workspace/ui/components/label";
import { DateTimePicker } from "@/components/date-time-picker";
import { cn } from "@workspace/ui/lib/utils";

import { useUserQuery } from "@/hooks/query/use-user-query";
import { useCustomerProfileQuery } from "@/features/auth/_hooks/query/use-customer-profile-query";
import { createLocalDateForBackend } from "@/utils/timezone";
import { useCreatePackageBookingMutation } from "@/features/customer/_hooks/query/use-create-package-booking-mutation";
import { createServiceBookingSchema, type ServiceBookingFormData } from "@/features/guest/_schemas/service-booking-schema";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";

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
}

export function HourlyServiceBookingForm({ service }: HourlyServiceBookingFormProps) {
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
	const { data: profileData, isLoading: profileLoading } = useCustomerProfileQuery();
	const createBookingMutation = useCreatePackageBookingMutation();

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
		return Math.max(0, hours * service.hourlyRate);
	}, [hours, service.hourlyRate]);

	// Pre-populate with user data if authenticated
	useEffect(() => {
		if (sessionData && profileData?.user) {
			const currentValues = form.getValues();
			form.reset({
				...currentValues,
				customerName: currentValues.customerName || profileData.user.name || "",
				customerEmail: currentValues.customerEmail || profileData.user.email || "",
				customerPhone: currentValues.customerPhone || profileData.user.phone || "",
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
			const [hours, minutes] = selectedTime.split(':').map(Number);
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
				carId: null, // Package booking, no specific car
				originAddress: pickupLocation,
				destinationAddress: destination,
				scheduledPickupTime: createLocalDateForBackend(
					format(data.scheduledPickupTime, "yyyy-MM-dd"),
					format(data.scheduledPickupTime, "HH:mm")
				),
				customerName: data.customerName,
				customerPhone: data.customerPhone,
				customerEmail: data.customerEmail,
				passengerCount: data.passengerCount,
				serviceDuration: data.serviceDuration,
				specialRequests: data.specialRequirements || "",
				stops: stops.length > 0 ? stops.map((stop, index) => ({
					address: stop,
					stopOrder: index + 1,
					waitingTime: 0,
					notes: ""
				})) : undefined,
			};

			console.log("🔍 FRONTEND DEBUG - Final Booking Data:", JSON.stringify(bookingData, null, 2));
			console.log("🔍 FRONTEND DEBUG - Scheduled Pickup Time Type:", typeof bookingData.scheduledPickupTime);

			const result = await createBookingMutation.mutateAsync(bookingData);
			setConfirmedBooking(result);
			setStep("confirmation");

			// Scroll to top after booking confirmation
			setTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}, 100);

			toast.success("Booking confirmed successfully!");
		} catch (error) {
			console.error("💥 FRONTEND DEBUG - Booking error:", error);
			console.error("💥 FRONTEND DEBUG - Error details:", JSON.stringify(error, null, 2));
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
				<div className="max-w-3xl mx-auto">
					<div className="flex items-center gap-4 mb-8">
						<CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
							<p className="text-gray-600">Your hourly service booking has been submitted successfully</p>
							{!sessionData && (
								<p className="text-sm text-blue-600 mt-2">
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
								<p className="text-sm text-gray-600">Hourly chauffeur service</p>
							</div>
							<Separator />

							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-600">Duration:</span>
									<span className="ml-2 font-medium">{hours} hours</span>
								</div>
								<div>
									<span className="text-gray-600">Total Cost:</span>
									<span className="ml-2 font-medium">${totalCost.toFixed(2)}</span>
								</div>
								<div className="col-span-2">
									<span className="text-gray-600">Pickup:</span>
									<span className="ml-2 font-medium">
										{selectedDate && selectedTime ? (
											(() => {
												const [hours, minutes] = selectedTime.split(':').map(Number);
												const combinedDateTime = new Date(selectedDate);
												combinedDateTime.setHours(hours, minutes, 0, 0);
												return format(combinedDateTime, "PPP 'at' p");
											})()
										) : 'Not set'}
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
							<div className="flex gap-3 flex-wrap">
								<Button onClick={() => navigate({ to: "/services" })} variant="outline">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back to Services
								</Button>
								{sessionData ? (
									<Button onClick={() => navigate({ to: "/my-bookings/trips" })}>
										View My Bookings
									</Button>
								) : (
									<Button onClick={() => navigate({ to: "/sign-in" })} variant="outline">
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
			<div className="max-w-6xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
				{/* Service Information Panel - Left Side */}
				<div className="xl:col-span-2">
					<div className="sticky top-8">
						<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
							{/* Service Header */}
							<div className="h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center relative">
								{service.bannerImageUrl ? (
									<img
										src={service.bannerImageUrl}
										alt={service.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="text-center">
										<div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
											<Clock className="w-10 h-10 text-primary/60" />
										</div>
										<h2 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h2>
										<p className="text-gray-600 text-sm px-4">
											{service.description || "Premium hourly chauffeur service"}
										</p>
									</div>
								)}
							</div>

							<div className="p-8">
								{/* Price Display */}
								<div className="text-center mb-8">
									<div className="inline-flex items-baseline gap-2 bg-primary/10 px-6 py-4 rounded-xl border border-primary/20">
										<span className="text-4xl font-black text-primary">
											${totalCost.toFixed(2)}
										</span>
										<span className="text-primary/80 text-sm font-medium">total cost</span>
									</div>
									<div className="mt-3">
										<Badge variant="secondary">Hourly Service</Badge>
									</div>
								</div>

								{/* Service Details */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
										<div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center">
											<Clock className="w-3 h-3 text-primary" />
										</div>
										Service Details
									</h3>

									<div className="space-y-3">
										<div className="flex justify-between items-center py-2 border-b border-gray-100">
											<span className="text-sm text-gray-600">Hourly Rate</span>
											<span className="font-semibold">${service.hourlyRate.toFixed(2)}/hour</span>
										</div>
										<div className="flex justify-between items-center py-2 border-b border-gray-100">
											<span className="text-sm text-gray-600">Duration Selected</span>
											<span className="font-semibold">{hours} hours</span>
										</div>
										<div className="flex justify-between items-center py-2 border-b border-gray-100">
											<span className="text-sm text-gray-600">Calculation</span>
											<span className="font-semibold">{hours} × ${service.hourlyRate.toFixed(2)}</span>
										</div>
									</div>
								</div>

								{/* Features */}
								{service.features && service.features.length > 0 && (
									<div className="mt-6">
										<h4 className="text-sm font-semibold text-gray-900 mb-3">Included Features</h4>
										<div className="grid grid-cols-1 gap-2">
											{service.features.slice(0, 4).map((feature, index) => (
												<div key={index} className="flex items-center gap-2 text-sm text-gray-600">
													<CheckCircle className="w-4 h-4 text-green-500" />
													<span>{feature}</span>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Payment Information */}
								<div className="mt-8 bg-blue-50 rounded-lg p-4">
									<div className="flex gap-3">
										<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
											<span className="text-primary text-sm">ℹ️</span>
										</div>
										<div>
											<p className="text-sm text-gray-800 font-semibold mb-2">Payment Information</p>
											<ul className="text-sm text-gray-600 space-y-1">
												<li>• Pay after service completion</li>
												<li>• Driver accepts cash or cashless payments</li>
												<li>• Online payment options available soon</li>
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
					<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
						<div className="bg-primary p-8">
							<h1 className="text-3xl font-bold text-white mb-2">Book Your Hourly Service</h1>
							<p className="text-primary-foreground/90">Complete your hourly service booking in just a few steps</p>
						</div>

						<form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
								{/* Service Configuration */}
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
											<span className="text-white text-lg font-bold">1</span>
										</div>
										<div>
											<h3 className="text-xl font-bold text-gray-900">Service Configuration</h3>
											<p className="text-gray-500 text-sm">Set your hourly service preferences</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										<div className="grid md:grid-cols-2 gap-5">
										{/* Hours Selection */}
										<div className="space-y-3">
											<Label className="text-base font-semibold flex items-center gap-2">
												<Clock className="w-4 h-4" />
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
													onChange={(e) => setHours(Math.max(2, parseInt(e.target.value) || 2))}
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
												<span className="text-sm text-gray-600">hours</span>
											</div>
											<p className="text-sm text-gray-500">Rate: ${service.hourlyRate.toFixed(2)}/hour</p>
										</div>

										{/* Number of Passengers */}
										<div className="space-y-3">
											<Label className="text-base font-semibold flex items-center gap-2">
												<Users className="w-4 h-4" />
												Number of Passengers *
											</Label>
											<Input
												type="number"
												min="1"
												max={maxPassengers}
												{...form.register("passengerCount", { valueAsNumber: true })}
												className="w-full"
											/>
											{form.formState.errors.passengerCount && (
												<p className="text-sm text-red-600">{form.formState.errors.passengerCount.message}</p>
											)}
										</div>
										</div>
									</div>
								</div>

								<Separator />

								{/* Journey Details */}
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
											<span className="text-white text-lg font-bold">2</span>
										</div>
										<div>
											<h3 className="text-xl font-bold text-gray-900">Journey Details</h3>
											<p className="text-gray-500 text-sm">Set your pickup and destination</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										{/* Pickup Location */}
										<div className="space-y-3">
											<Label className="text-base font-semibold">Pickup Location (Origin) *</Label>
											<GooglePlacesInput
												value={pickupLocation}
												onChange={setPickupLocation}
												placeholder="Enter pickup address..."
												className="w-full h-12"
											/>
										</div>

										{/* Destination */}
										<div className="space-y-3">
											<Label className="text-base font-semibold">Destination *</Label>
											<GooglePlacesInput
												value={destination}
												onChange={setDestination}
												placeholder="Enter destination address..."
												className="w-full h-12"
											/>
										</div>

										{/* Stops */}
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<Label className="text-base font-semibold">Additional Stops (Optional)</Label>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={addStop}
													disabled={stops.length >= 5}
													className="text-sm"
												>
													<Plus className="w-4 h-4 mr-1" />
													Add Stop
												</Button>
											</div>
											{stops.map((stop, index) => (
												<div key={index} className="flex gap-3">
													<GooglePlacesInput
														value={stop}
														onChange={(value) => updateStop(index, value)}
														placeholder={`Stop ${index + 1} address...`}
														className="flex-1 h-12"
													/>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => removeStop(index)}
														className="px-3"
													>
														<X className="w-4 h-4" />
													</Button>
												</div>
											))}
											{stops.length === 0 && (
												<p className="text-sm text-gray-500 italic">No additional stops added</p>
											)}
										</div>
									</div>
								</div>

								<Separator />

								{/* Contact Information */}
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
											<span className="text-white text-lg font-bold">3</span>
										</div>
										<div>
											<h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
											<p className="text-gray-500 text-sm">Your details for booking confirmation</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										<div className="grid md:grid-cols-2 gap-4">
											<div className="space-y-3">
												<Label className="text-base font-semibold">Full Name *</Label>
												<Input
													{...form.register("customerName")}
													placeholder="Your full name"
													className="h-12"
												/>
												{form.formState.errors.customerName && (
													<p className="text-sm text-red-600">{form.formState.errors.customerName.message}</p>
												)}
											</div>

											<div className="space-y-3">
												<Label className="text-base font-semibold">Phone Number *</Label>
												<Input
													type="tel"
													{...form.register("customerPhone")}
													placeholder="+1 (555) 123-4567"
													className="h-12"
												/>
												{form.formState.errors.customerPhone && (
													<p className="text-sm text-red-600">{form.formState.errors.customerPhone.message}</p>
												)}
											</div>
										</div>

										<div className="space-y-3">
											<Label className="text-base font-semibold">Email Address *</Label>
											<Input
												type="email"
												{...form.register("customerEmail")}
												placeholder="your.email@example.com"
												className="h-12"
											/>
											{form.formState.errors.customerEmail && (
												<p className="text-sm text-red-600">{form.formState.errors.customerEmail.message}</p>
											)}
										</div>
									</div>
								</div>

								<Separator />

								{/* Booking Details */}
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
											<span className="text-white text-lg font-bold">4</span>
										</div>
										<div>
											<h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
											<p className="text-gray-500 text-sm">Choose your pickup date and time</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										{/* Pickup Date and Time */}
										<div className="space-y-3">
											<Label className="text-base font-semibold flex items-center gap-2">
												<Calendar className="w-4 h-4" />
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
											<p className="text-sm text-gray-500">
												Must be at least 24 hours from now
											</p>
										</div>

										{/* Additional Notes */}
										<div className="space-y-3">
											<Label className="text-base font-semibold">Additional Notes (Optional)</Label>
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
										disabled={createBookingMutation.isPending || profileLoading || !pickupLocation || !destination || !selectedDate || !selectedTime}
										className="w-full h-14 text-lg font-bold"
									>
										{createBookingMutation.isPending ? (
											<>
												<Loader2 className="w-5 h-5 mr-2 animate-spin" />
												Creating Booking...
											</>
										) : (
											<>
												<Package className="w-5 h-5 mr-2" />
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