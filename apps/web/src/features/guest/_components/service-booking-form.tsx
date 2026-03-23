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
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import {
	Calendar,
	CheckCircle,
	Clock,
	Loader2,
	MapPin,
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
import {
	createServiceBookingSchema,
	type ServiceBookingFormData,
} from "@/features/guest/_schemas/service-booking-schema";
import { GooglePlacesInput } from "@/features/marketing/_pages/home/_components/google-places-input-simple";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { createLocalDateForBackend } from "@/utils/timezone";

interface ServiceBookingFormProps {
	service: {
		id: string;
		name: string;
		fixedPrice?: number;
		hourlyRate?: number;
		serviceType: string; // 'hourly' or 'fixed'
		maxPassengers?: number;
		description?: string;
		bannerImageUrl?: string;
		features?: string[];
	};
}

export function ServiceBookingForm({ service }: ServiceBookingFormProps) {
	const [date, setDate] = useState<Date>();
	const [step, setStep] = useState<"form" | "confirmation">("form");
	const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
	const [pickupLocation, setPickupLocation] = useState("");
	const [destination, setDestination] = useState("");
	const [stops, setStops] = useState<string[]>([]);
	const [hours, setHours] = useState<number>(2);

	const navigate = useNavigate();
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	const { data: profileData, isLoading: profileLoading } =
		useCustomerProfileQuery();
	const createBookingMutation = useCreatePackageBookingMutation();

	// Determine if this is an hourly service
	const isHourlyService =
		service.serviceType === "hourly" || !!service.hourlyRate;

	// Create schema based on service type - ensure minimum 20 passengers
	const maxPassengers = Math.max(service.maxPassengers || 20, 20);
	const schema = createServiceBookingSchema(maxPassengers, isHourlyService);

	const form = useForm<ServiceBookingFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			customerName: "",
			customerEmail: "",
			customerPhone: "",
			passengerCount: 1,
			luggageCount: 0,
			serviceDuration: isHourlyService ? 2 : undefined,
			specialRequirements: "",
		},
	});

	// Calculate total cost for hourly services
	const totalCost = useMemo(() => {
		if (isHourlyService && service.hourlyRate) {
			return hours * service.hourlyRate;
		}
		return service.fixedPrice || 0;
	}, [isHourlyService, service.hourlyRate, service.fixedPrice, hours]);

	// Pre-populate with user data if authenticated
	useEffect(() => {
		if (sessionData?.user && profileData?.user) {
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

	const onSubmit = async (data: ServiceBookingFormData) => {
		// Check authentication before allowing booking
		if (!sessionData?.user) {
			toast.error("Please sign in to complete your booking.");
			// Preserve current URL for redirect after sign-in
			const currentPath = window.location.pathname + window.location.search;
			navigate({
				to: "/sign-in",
				search: { redirect: currentPath },
			});
			return;
		}

		// Create booking data with proper user ID - use timezone-aware date handling
		const dateString = data.bookingDate.toISOString().split("T")[0];

		const bookingData = {
			packageId: service.id,
			carId: null, // Will be assigned by admin
			originAddress: "Service location (TBD)", // Service packages don't have fixed locations
			destinationAddress: "Service destination (TBD)",
			scheduledPickupTime: createLocalDateForBackend(
				dateString,
				data.bookingTime,
			),
			customerName: data.customerName,
			customerPhone: data.customerPhone,
			customerEmail: data.customerEmail,
			passengerCount: data.passengerCount,
			specialRequests: data.specialRequirements,
			requirePayment: true, // Payment required before confirmation - same as guest/client flow
		};

		try {
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
		} catch (error) {
			console.error("Service booking failed:", error);
		}
	};

	// Show confirmation screen after successful booking
	if (step === "confirmation" && confirmedBooking) {
		return (
			<div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
				{/* Header */}
				<div className="space-y-4 text-center">
					<CheckCircle className="mx-auto h-16 w-16 text-green-500" />
					<div>
						<h1 className="font-bold text-3xl text-gray-900">
							Service Booked!
						</h1>
						<p className="text-gray-600">
							Your service booking has been submitted successfully
						</p>
						{!sessionData?.user && (
							<p className="mt-2 text-blue-600 text-sm">
								💡 Tip: Create an account to easily manage your bookings
							</p>
						)}
					</div>
				</div>

				{/* Service Details */}
				<div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
					<h3 className="mb-4 font-semibold text-gray-900 text-lg">
						Booking Details
					</h3>
					<div className="space-y-3">
						<div className="flex justify-between">
							<span className="text-gray-600">Service:</span>
							<span className="font-medium">{service.name}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Price:</span>
							<span className="font-medium">
								${service.fixedPrice?.toFixed(2) || "0.00"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Passengers:</span>
							<span className="font-medium">
								{form.getValues("passengerCount")}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Date & Time:</span>
							<span className="font-medium">
								{date ? format(date, "PPP") : "Date selected"} at{" "}
								{form.getValues("bookingTime")}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Contact:</span>
							<span className="font-medium">
								{form.getValues("customerName")}
							</span>
						</div>
					</div>
				</div>

				{/* Payment Notice - shown only if no redirect to payment (fallback) */}
				<div className="rounded-xl border border-blue-200 bg-blue-50 p-4 sm:p-6">
					<h3 className="mb-2 font-semibold text-blue-900 text-lg">
						What's Next?
					</h3>
					<ul className="space-y-1 text-blue-800 text-sm">
						<li>• Complete payment to confirm your booking</li>
						<li>• You'll receive confirmation via email after payment</li>
						<li>• Final charge occurs after service completion</li>
						<li>• Contact us anytime for questions or changes</li>
					</ul>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button onClick={() => navigate({ to: "/" })} className="flex-1">
						Back to Home
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							setStep("form");
							setConfirmedBooking(null);
						}}
						className="flex-1"
					>
						Book Another Service
					</Button>
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
								{/* Service Image Banner */}
								{service.bannerImageUrl ? (
									<div className="relative h-64 overflow-hidden">
										<img
											src={service.bannerImageUrl}
											alt={service.name}
											className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
										<div className="absolute right-6 bottom-6 left-6">
											<div className="text-white">
												<h2 className="mb-2 font-bold text-2xl">
													{service.name}
												</h2>
												<p className="text-sm text-white/90">
													{service.description ||
														"Premium chauffeur service with professional standards"}
												</p>
											</div>
										</div>
									</div>
								) : (
									<div className="flex h-64 items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5">
										<div className="text-center">
											<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
												<Calendar className="h-10 w-10 text-primary/60" />
											</div>
											<h2 className="mb-2 font-bold text-2xl text-gray-800">
												{service.name}
											</h2>
											<p className="px-4 text-gray-600 text-sm">
												{service.description ||
													"Premium chauffeur service with professional standards"}
											</p>
										</div>
									</div>
								)}

								<div className="p-8">
									{/* Price Display - Only for fixed-type services */}
									{!isHourlyService && service.fixedPrice && (
										<div className="mb-8 text-center">
											<div className="inline-flex items-baseline gap-2 rounded-xl border border-primary/20 bg-primary/10 px-6 py-4">
												<span className="font-black text-4xl text-primary">
													${service.fixedPrice?.toFixed(2) || "0.00"}
												</span>
												<span className="font-medium text-primary/80 text-sm">
													per booking
												</span>
											</div>
											<div className="mt-3">
												<span className="inline-block rounded-full bg-primary/15 px-3 py-1 font-semibold text-primary text-xs">
													Fixed Price - No Hidden Fees
												</span>
											</div>
										</div>
									)}

									{/* Service Description */}
									<div className="space-y-4">
										<h3 className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
											<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
												<CheckCircle className="h-3 w-3 text-primary" />
											</div>
											Service Details
										</h3>

										<div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
											<p className="text-gray-700 leading-relaxed">
												{service.description ||
													"Premium chauffeur service with professional standards and exceptional comfort."}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Booking Form Panel - Right Side */}
					<div className="xl:col-span-3">
						<div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
							<div className="bg-primary p-8">
								<h1 className="mb-2 font-bold text-3xl text-white">
									Book This Service
								</h1>
								<p className="text-primary-foreground/90">
									Complete your service booking in just a few steps
								</p>
							</div>

							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8 p-8"
							>
								{/* Contact Information Section */}
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
											<span className="font-bold text-lg text-white">1</span>
										</div>
										<div>
											<h3 className="font-bold text-gray-900 text-xl">
												Contact Information
											</h3>
											<p className="text-gray-500 text-sm">
												We'll use this to reach you about your booking
											</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										<div>
											<label className="mb-3 block font-semibold text-gray-800 text-sm">
												Full Name *
											</label>
											<Input
												{...form.register("customerName")}
												placeholder="Ivan Gemota"
												className="h-12 text-base"
												error={form.formState.errors.customerName?.message}
											/>
										</div>

										<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
											<div>
												<label className="mb-3 block font-semibold text-gray-800 text-sm">
													Email Address *
												</label>
												<Input
													type="email"
													{...form.register("customerEmail")}
													placeholder="ivangemota23@gmail.com"
													className="h-12 text-base"
													error={form.formState.errors.customerEmail?.message}
												/>
											</div>

											<div>
												<label className="mb-3 block font-semibold text-gray-800 text-sm">
													Phone Number *
												</label>
												<Input
													type="tel"
													{...form.register("customerPhone")}
													placeholder="+1 (555) 123-4567"
													className="h-12 text-base"
													error={form.formState.errors.customerPhone?.message}
												/>
											</div>
										</div>
									</div>
								</div>

								{/* Booking Details Section */}
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
											<span className="font-bold text-lg text-white">2</span>
										</div>
										<div>
											<h3 className="font-bold text-gray-900 text-xl">
												Booking Details
											</h3>
											<p className="text-gray-500 text-sm">
												Tell us about your service needs
											</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										<div>
											<label className="mb-3 block font-semibold text-gray-800 text-sm">
												Number of Passengers *
											</label>
											<Input
												type="number"
												min={1}
												max={maxPassengers}
												placeholder="e.g. 2"
												{...form.register("passengerCount", {
													valueAsNumber: true,
												})}
												className="h-12 text-base"
												error={form.formState.errors.passengerCount?.message}
											/>
										</div>

										<DateTimePicker
											selectedDate={date}
											selectedTime={form.watch("bookingTime") || ""}
											onDateChange={(selectedDate) => {
												setDate(selectedDate);
												if (selectedDate) {
													form.setValue("bookingDate", selectedDate);
													// Also update scheduledPickupTime for validation
													const currentTime = form.getValues("bookingTime");
													if (currentTime) {
														const combinedDateTime = createLocalDateForBackend(
															selectedDate.toISOString().split("T")[0],
															currentTime,
														);
														form.setValue(
															"scheduledPickupTime",
															new Date(combinedDateTime),
														);
													}
												}
											}}
											onTimeChange={(time) => {
												form.setValue("bookingTime", time);
												// Also update scheduledPickupTime for validation
												const currentDate = form.getValues("bookingDate");
												if (currentDate && time) {
													const combinedDateTime = createLocalDateForBackend(
														currentDate.toISOString().split("T")[0],
														time,
													);
													form.setValue(
														"scheduledPickupTime",
														new Date(combinedDateTime),
													);
												}
											}}
											dateError={form.formState.errors.bookingDate?.message}
											timeError={form.formState.errors.bookingTime?.message}
											dateLabel="Service Date *"
											timeLabel="Pickup Time *"
										/>

										<div>
											<label className="mb-3 block font-semibold text-gray-800 text-sm">
												Special Requirements{" "}
												<span className="font-normal text-gray-400">
													(Optional)
												</span>
											</label>
											<Textarea
												{...form.register("specialRequirements")}
												placeholder="Any special requests, accessibility needs, or requirements..."
												rows={4}
												className="resize-none"
											/>
										</div>
									</div>
								</div>

								{/* Booking Summary */}
								<div className="rounded-xl border border-primary/20 bg-primary/10 p-6">
									<div className="mb-6 flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
											<span className="text-lg text-white">💰</span>
										</div>
										<h3 className="font-bold text-gray-900 text-lg">
											Booking Summary
										</h3>
									</div>

									<div className="space-y-4">
										<div className="flex items-center justify-between rounded-lg bg-white p-4">
											<div>
												<span className="font-semibold text-gray-800">
													Service Price
												</span>
												<p className="text-gray-600 text-sm">
													All-inclusive fixed rate
												</p>
											</div>
											<span className="font-bold text-2xl text-primary">
												${service.fixedPrice?.toFixed(2) || "0.00"}
											</span>
										</div>

										<div className="rounded-lg border border-primary/20 bg-white p-4">
											<div className="flex items-start gap-3">
												<div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
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

								{/* Action Button */}
								<div className="pt-4">
									<Button
										type="submit"
										className="h-14 w-full font-bold text-lg"
										disabled={
											createBookingMutation.isPending ||
											sessionLoading ||
											profileLoading
										}
									>
										{createBookingMutation.isPending ? (
											<>
												<Loader2 className="mr-3 h-6 w-6 animate-spin" />
												Creating Your Booking...
											</>
										) : sessionLoading || profileLoading ? (
											<>
												<Loader2 className="mr-3 h-6 w-6 animate-spin" />
												Loading...
											</>
										) : sessionData?.user ? (
											"Book Service Now"
										) : (
											"Sign In & Book Service"
										)}
									</Button>

									<p className="mt-6 text-center text-gray-500 text-sm leading-relaxed">
										By proceeding, you agree to our{" "}
										<span className="cursor-pointer text-primary underline hover:text-primary/80">
											terms of service
										</span>{" "}
										and{" "}
										<span className="cursor-pointer text-primary underline hover:text-primary/80">
											privacy policy
										</span>
										.
									</p>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
