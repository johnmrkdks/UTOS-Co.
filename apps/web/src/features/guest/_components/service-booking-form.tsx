import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";

import { useUserQuery } from "@/hooks/query/use-user-query";
import { useCreatePackageBookingMutation } from "@/features/customer/_hooks/query/use-create-package-booking-mutation";
import { serviceBookingSchema, type ServiceBookingFormData } from "@/features/guest/_schemas/service-booking-schema";

interface ServiceBookingFormProps {
	service: {
		id: string;
		name: string;
		fixedPrice: number;
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
	const navigate = useNavigate();
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	const createBookingMutation = useCreatePackageBookingMutation();

	const form = useForm<ServiceBookingFormData>({
		resolver: zodResolver(serviceBookingSchema),
		defaultValues: {
			customerName: "",
			customerEmail: "",
			customerPhone: "",
			passengerCount: 1,
			bookingTime: "",
			specialRequirements: "",
		},
	});

	// Pre-populate with user data if authenticated
	useEffect(() => {
		if (sessionData?.user) {
			const currentValues = form.getValues();
			form.reset({
				...currentValues,
				customerName: currentValues.customerName || sessionData.user.name || "",
				customerEmail: currentValues.customerEmail || sessionData.user.email || "",
			});
		}
	}, [sessionData, form]);

	const onSubmit = async (data: ServiceBookingFormData) => {
		// Check authentication before allowing booking
		if (!sessionData?.user) {
			toast.error("Please sign in to complete your booking.");
			// Preserve current URL for redirect after sign-in
			const currentPath = window.location.pathname + window.location.search;
			navigate({
				to: "/sign-in",
				search: { redirect: currentPath }
			});
			return;
		}

		// Create booking data with proper user ID
		const scheduledPickupTime = new Date(`${data.bookingDate.toISOString().split('T')[0]}T${data.bookingTime}:00.000Z`);

		const bookingData = {
			packageId: service.id,
			carId: null, // Will be assigned by admin
			originAddress: "Service location (TBD)", // Service packages don't have fixed locations
			destinationAddress: "Service destination (TBD)",
			scheduledPickupTime: scheduledPickupTime.toISOString(),
			customerName: data.customerName,
			customerPhone: data.customerPhone,
			customerEmail: data.customerEmail,
			passengerCount: data.passengerCount,
			specialRequests: data.specialRequirements,
		};

		try {
			const result = await createBookingMutation.mutateAsync(bookingData);
			setConfirmedBooking(result);
			setStep("confirmation");
		} catch (error) {
			console.error("Service booking failed:", error);
		}
	};

	// Time slots for booking
	const timeSlots = [
		"08:00", "09:00", "10:00", "11:00",
		"12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
		"18:00", "19:00", "20:00", "21:00", "22:00"
	];

	// Show confirmation screen after successful booking
	if (step === "confirmation" && confirmedBooking) {
		return (
			<div className="w-full max-w-2xl mx-auto space-y-6 p-4 sm:p-6">
				{/* Header */}
				<div className="text-center space-y-4">
					<CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Service Booked!</h1>
						<p className="text-gray-600">Your service booking has been submitted successfully</p>
						{!sessionData?.user && (
							<p className="text-sm text-blue-600 mt-2">
								💡 Tip: Create an account to easily manage your bookings
							</p>
						)}
					</div>
				</div>

				{/* Service Details */}
				<div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
					<div className="space-y-3">
						<div className="flex justify-between">
							<span className="text-gray-600">Service:</span>
							<span className="font-medium">{service.name}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Price:</span>
							<span className="font-medium">${(service.fixedPrice / 100).toFixed(2)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Passengers:</span>
							<span className="font-medium">{form.getValues("passengerCount")}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Date & Time:</span>
							<span className="font-medium">
								{date ? format(date, "PPP") : "Date selected"} at {form.getValues("bookingTime")}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Contact:</span>
							<span className="font-medium">{form.getValues("customerName")}</span>
						</div>
					</div>
				</div>

				{/* Payment Notice */}
				<div className="bg-blue-50 rounded-xl border border-blue-200 p-4 sm:p-6">
					<h3 className="text-lg font-semibold text-blue-900 mb-2">What's Next?</h3>
					<ul className="text-blue-800 space-y-1 text-sm">
						<li>• We'll review your booking and confirm within 2-4 hours</li>
						<li>• You'll receive confirmation via email and SMS</li>
						<li>• Payment is processed after service completion</li>
						<li>• You can contact us anytime for questions or changes</li>
					</ul>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-3">
					<Button
						onClick={() => navigate({ to: "/" })}
						className="flex-1"
					>
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
			<div className="max-w-6xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
					{/* Service Information Panel - Left Side */}
					<div className="xl:col-span-2">
						<div className="sticky top-8">
							<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
								{/* Service Image Banner */}
								{service.bannerImageUrl ? (
									<div className="h-64 relative overflow-hidden">
										<img
											src={service.bannerImageUrl}
											alt={service.name}
											className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
										<div className="absolute bottom-6 left-6 right-6">
											<div className="text-white">
												<h2 className="text-2xl font-bold mb-2">{service.name}</h2>
												<p className="text-white/90 text-sm">
													{service.description || "Premium chauffeur service with professional standards"}
												</p>
											</div>
										</div>
									</div>
								) : (
									<div className="h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
										<div className="text-center">
											<div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
												<CalendarIcon className="w-10 h-10 text-primary/60" />
											</div>
											<h2 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h2>
											<p className="text-gray-600 text-sm px-4">
												{service.description || "Premium chauffeur service with professional standards"}
											</p>
										</div>
									</div>
								)}

								<div className="p-8">
									{/* Price Display */}
									<div className="text-center mb-8">
										<div className="inline-flex items-baseline gap-2 bg-primary/10 px-6 py-4 rounded-xl border border-primary/20">
											<span className="text-4xl font-black text-primary">
												${(service.fixedPrice / 100).toFixed(0)}
											</span>
											<span className="text-primary/80 text-sm font-medium">per booking</span>
										</div>
										<div className="mt-3">
											<span className="inline-block bg-primary/15 text-primary text-xs font-semibold px-3 py-1 rounded-full">
												Fixed Price - No Hidden Fees
											</span>
										</div>
									</div>

									{/* Service Features */}
									<div className="space-y-4">
										<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
											<div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center">
												<CheckCircle className="w-3 h-3 text-primary" />
											</div>
											What's Included
										</h3>
										
										<div className="grid gap-3">
											{service.features && service.features.length > 0 ? (
												service.features.map((feature, index) => (
													<div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
														<div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
														<span className="text-sm text-gray-700 font-medium">{feature}</span>
													</div>
												))
											) : (
												<>
													<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
														<div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
														<span className="text-sm text-gray-700 font-medium">Max {service.maxPassengers || 4} passengers</span>
													</div>
													<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
														<div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
														<span className="text-sm text-gray-700 font-medium">Professional chauffeur</span>
													</div>
													<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
														<div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
														<span className="text-sm text-gray-700 font-medium">Fuel included</span>
													</div>
													<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
														<div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
														<span className="text-sm text-gray-700 font-medium">Tolls separate</span>
													</div>
												</>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Booking Form Panel - Right Side */}
					<div className="xl:col-span-3">
						<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
							<div className="bg-primary p-8">
								<h1 className="text-3xl font-bold text-white mb-2">Book This Service</h1>
								<p className="text-primary-foreground/90">Complete your service booking in just a few steps</p>
							</div>

							<form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
								{/* Contact Information Section */}
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
											<span className="text-white text-lg font-bold">1</span>
										</div>
										<div>
											<h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
											<p className="text-gray-500 text-sm">We'll use this to reach you about your booking</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										<div>
											<label className="block text-sm font-semibold text-gray-800 mb-3">Full Name *</label>
											<Input
												{...form.register("customerName")}
												placeholder="Ivan Gemota"
												className="h-12 text-base"
												error={form.formState.errors.customerName?.message}
											/>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
											<div>
												<label className="block text-sm font-semibold text-gray-800 mb-3">Email Address *</label>
												<Input
													type="email"
													{...form.register("customerEmail")}
													placeholder="ivangemota23@gmail.com"
													className="h-12 text-base"
													error={form.formState.errors.customerEmail?.message}
												/>
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-800 mb-3">Phone Number *</label>
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
										<div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
											<span className="text-white text-lg font-bold">2</span>
										</div>
										<div>
											<h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
											<p className="text-gray-500 text-sm">Tell us about your service needs</p>
										</div>
									</div>

									<div className="space-y-5 pl-14">
										<div>
											<label className="block text-sm font-semibold text-gray-800 mb-3">Number of Passengers *</label>
											<Input
												type="number"
												min={1}
												max={service.maxPassengers || 8}
												{...form.register("passengerCount", { valueAsNumber: true })}
												className="h-12 text-base"
												error={form.formState.errors.passengerCount?.message}
											/>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
											<div>
												<label className="block text-sm font-semibold text-gray-800 mb-3">Service Date *</label>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className={cn(
																"w-full h-12 justify-start text-left text-base",
																!date && "text-muted-foreground"
															)}
														>
															<CalendarIcon className="mr-3 h-5 w-5" />
															{date ? format(date, "PPP") : "Pick a date"}
														</Button>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="single"
															selected={date}
															onSelect={(selectedDate) => {
																setDate(selectedDate);
																form.setValue("bookingDate", selectedDate!);
															}}
															disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
												{form.formState.errors.bookingDate && (
													<p className="text-sm text-red-600 mt-2 font-medium">
														{form.formState.errors.bookingDate.message}
													</p>
												)}
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-800 mb-3">Pickup Time *</label>
												<select
													{...form.register("bookingTime")}
													className="w-full h-12 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
												>
													<option value="">Select time</option>
													{timeSlots.map((time) => (
														<option key={time} value={time}>
															{time}
														</option>
													))}
												</select>
												{form.formState.errors.bookingTime && (
													<p className="text-sm text-red-600 mt-2 font-medium">
														{form.formState.errors.bookingTime.message}
													</p>
												)}
											</div>
										</div>

										<div>
											<label className="block text-sm font-semibold text-gray-800 mb-3">
												Special Requirements <span className="text-gray-400 font-normal">(Optional)</span>
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
								<div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
									<div className="flex items-center gap-3 mb-6">
										<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
											<span className="text-white text-lg">💰</span>
										</div>
										<h3 className="text-lg font-bold text-gray-900">Booking Summary</h3>
									</div>

									<div className="space-y-4">
										<div className="flex justify-between items-center p-4 bg-white rounded-lg">
											<div>
												<span className="font-semibold text-gray-800">Service Price</span>
												<p className="text-sm text-gray-600">All-inclusive fixed rate</p>
											</div>
											<span className="text-2xl font-bold text-primary">
												${(service.fixedPrice / 100).toFixed(2)}
											</span>
										</div>

										<div className="bg-white rounded-lg p-4 border border-primary/20">
											<div className="flex items-start gap-3">
												<div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center mt-0.5">
													<span className="text-primary text-sm">ℹ️</span>
												</div>
												<div>
													<p className="text-sm text-gray-800 font-semibold mb-2">Payment Information</p>
													<ul className="text-sm text-gray-600 space-y-1">
														<li>• No payment required now</li>
														<li>• Pay securely after service completion</li>
														<li>• Multiple payment options available</li>
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
										className="w-full h-14 text-lg font-bold"
										disabled={createBookingMutation.isPending || sessionLoading}
									>
										{createBookingMutation.isPending ? (
											<>
												<Loader2 className="mr-3 h-6 w-6 animate-spin" />
												Creating Your Booking...
											</>
										) : sessionLoading ? (
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

									<p className="text-sm text-gray-500 text-center mt-6 leading-relaxed">
										By proceeding, you agree to our{" "}
										<span className="text-primary underline cursor-pointer hover:text-primary/80">terms of service</span>{" "}
										and{" "}
										<span className="text-primary underline cursor-pointer hover:text-primary/80">privacy policy</span>.
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
