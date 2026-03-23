import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { 
	ArrowLeft, 
	Clock, 
	Users, 
	MapPin, 
	Calendar,
	Phone,
	Mail,
	User,
	Loader2,
	Package,
	CheckCircle,
	AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Link, useParams, useRouter } from "@tanstack/react-router";
import { useGetPublishedServiceByIdQuery } from "@/features/customer/_hooks/query/use-get-published-service-by-id-query";
import { useCreateServiceBookingMutation } from "@/features/customer/_hooks/query/use-create-service-booking-mutation";
import { useGetAvailableCarsQuery } from "@/features/customer/_hooks/query/use-get-available-cars-query";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { createServiceBookingSchema, type ServiceBookingFormData } from "@/features/customer/_schemas/service-booking-schema";
import { z } from "zod";

export function BookServicePage() {
	const { serviceId } = useParams({ from: "/dashboard/_layout/book-service/$serviceId" });
	const router = useRouter();
	const { session } = useUserQuery();
	const user = session?.user;
	
	// Fetch service details and available cars
	const { data: service, isLoading, error } = useGetPublishedServiceByIdQuery(serviceId);
	const { data: carsData, isLoading: carsLoading, error: carsError } = useGetAvailableCarsQuery();
	const createBookingMutation = useCreateServiceBookingMutation();


	// Determine if service is hourly based on service type rate type
	const isHourlyService = (service as any)?.serviceType?.rateType === "hourly";

	// Create dynamic schema based on service type
	const ServiceBookingSchema = createServiceBookingSchema(service?.maxPassengers || undefined, isHourlyService);

	// Extended form data type to include fields used in this form
	type ExtendedFormData = ServiceBookingFormData & {
		originAddress?: string;
		destinationAddress?: string;
		scheduledPickupDate?: string;
		scheduledPickupTime?: string;
		customerName?: string;
		customerPhone?: string;
		customerEmail?: string;
		specialRequests?: string;
	};

	// Form state
	const [formData, setFormData] = useState<Partial<ExtendedFormData>>({
		passengerCount: 1,
		luggageCount: 0,
		serviceDuration: isHourlyService ? 1 : undefined, // Default to 1 hour for hourly services
	});
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [step, setStep] = useState<"details" | "booking" | "confirmation">("details");

	// Helper functions
	const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(0)}`;
	
	const formatDuration = (minutes?: number) => {
		if (!minutes) return "Custom duration";
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
		if (hours > 0) return `${hours} hours`;
		return `${mins} minutes`;
	};

	const getServiceTypeDisplay = (serviceType: string) => {
		switch (serviceType) {
			case "transfer": return "Transfer";
			case "tour": return "Tour";
			case "event": return "Event";
			case "hourly": return "Hourly";
			default: return serviceType;
		}
	};

	// Calculate total price based on service type
	const calculateTotalPrice = () => {
		if (!service) return 0;

		if (isHourlyService && service.hourlyRate && formData.serviceDuration) {
			return service.hourlyRate * formData.serviceDuration;
		}

		return service.fixedPrice || 0;
	};

	// Format price display for hourly services
	const formatPriceDisplay = () => {
		if (!service) return "$0";

		if (isHourlyService && service.hourlyRate) {
			if (formData.serviceDuration) {
				return `${formatPrice(service.hourlyRate)} × ${formData.serviceDuration}h = ${formatPrice(calculateTotalPrice())}`;
			}
			return `${formatPrice(service.hourlyRate)} per hour`;
		}

		return formatPrice(service.fixedPrice || 0);
	};

	const updateFormData = (field: keyof ExtendedFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		try {
			// Basic validation for required fields
			const errors: Record<string, string> = {};

			if (!formData.passengerCount || formData.passengerCount < 1) {
				errors.passengerCount = "At least 1 passenger required";
			}

			if (isHourlyService && (!formData.serviceDuration || formData.serviceDuration < 1)) {
				errors.serviceDuration = "Service duration is required for hourly services";
			}

			if (!formData.scheduledPickupDate) {
				errors.scheduledPickupDate = "Pickup date is required";
			}

			if (!formData.scheduledPickupTime) {
				errors.scheduledPickupTime = "Pickup time is required";
			}

			// If basic validation fails, don't proceed to schema validation
			if (Object.keys(errors).length > 0) {
				setFormErrors(errors);
				return false;
			}

			// Schema validation with date conversion
			const scheduledPickupTime = new Date(`${formData.scheduledPickupDate}T${formData.scheduledPickupTime}`);

			const validationData = {
				passengerCount: formData.passengerCount!,
				luggageCount: formData.luggageCount || 0,
				scheduledPickupTime,
				...(isHourlyService && { serviceDuration: formData.serviceDuration }),
				specialRequirements: formData.specialRequests
			};

			const result = ServiceBookingSchema.safeParse(validationData);

			if (!result.success) {
				const zodErrors: Record<string, string> = {};
				(result.error as any).errors.forEach((error: any) => {
					const path = error.path.join('.');
					zodErrors[path] = error.message;
				});
				setFormErrors(zodErrors);
				return false;
			}

			setFormErrors({});
			return true;
		} catch (error) {
			console.error("Validation error:", error);
			return false;
		}
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			toast.error("Please fill in all required fields", {
				description: "Check the form for any errors and try again."
			});
			return;
		}

		if (!service) {
			toast.error("Service information not loaded", {
				description: "Please refresh the page and try again."
			});
			return;
		}

		if (!user) {
			toast.error("User not authenticated", {
				description: "Please sign in to book a service."
			});
			return;
		}

		const availableCar = carsData?.data?.[0];
		if (!availableCar) {
			toast.error("No vehicles available", {
				description: "Currently no vehicles are available for booking. Please try again later."
			});
			return;
		}

		const scheduledPickupTime = new Date(`${formData.scheduledPickupDate}T${formData.scheduledPickupTime}`);

		const bookingPayload = {
			packageId: service.id,
			carId: availableCar.id,
			userId: user.id,
			originAddress: formData.originAddress || "TBD", // Package services may not require specific pickup
			destinationAddress: formData.destinationAddress || "TBD", // Package services may not require specific destination
			scheduledPickupTime,
			customerName: user.name || "",
			customerPhone: "N/A", // User doesn't have phone in session
			customerEmail: user.email || "",
			passengerCount: formData.passengerCount!,
			specialRequests: formData.specialRequests || "",
			...(isHourlyService && { serviceDuration: formData.serviceDuration })
		};

		try {
			const result = await createBookingMutation.mutateAsync(bookingPayload);
			setStep("confirmation");
		} catch (error) {
			// Error handling is done in the mutation hook
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-gray-600">Loading service details...</span>
			</div>
		);
	}

	if (error || !service) {
		return (
			<div className="text-center py-12">
				<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
				<h3 className="text-lg font-medium text-gray-900 mb-2">Service not found</h3>
				<p className="text-gray-600 mb-4">The service you're looking for doesn't exist or is no longer available</p>
				<Button asChild>
					<Link to="/dashboard/services">Browse Services</Link>
				</Button>
			</div>
		);
	}

	if (step === "confirmation") {
		return (
			<div className="max-w-2xl mx-auto space-y-6">
				{/* Header */}
				<div className="text-center space-y-4">
					<CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
						<p className="text-gray-600">Your service booking has been submitted successfully</p>
					</div>
				</div>

				{/* Booking Details */}
				<Card>
					<CardHeader>
						<CardTitle>Booking Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h4 className="font-medium">{service.name}</h4>
							<p className="text-sm text-gray-600">{service.description}</p>
						</div>
						<Separator />
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-gray-600">Pickup:</span>
								<p className="font-medium">{formData.originAddress}</p>
							</div>
							<div>
								<span className="text-gray-600">Destination:</span>
								<p className="font-medium">{formData.destinationAddress}</p>
							</div>
							<div>
								<span className="text-gray-600">Date & Time:</span>
								<p className="font-medium">{formData.scheduledPickupDate} at {formData.scheduledPickupTime}</p>
							</div>
							<div>
								<span className="text-gray-600">Passengers:</span>
								<p className="font-medium">{formData.passengerCount} passenger{formData.passengerCount !== 1 ? 's' : ''}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Next Steps */}
				<Card>
					<CardContent className="p-6 text-center">
						<h3 className="font-medium mb-2">What happens next?</h3>
						<p className="text-sm text-gray-600 mb-4">
							Our team will review your booking and contact you within 24 hours to confirm details and assign a driver.
						</p>
						<div className="space-y-2">
							<Button className="w-full" asChild>
								<Link to="/my-bookings">View My Bookings</Link>
							</Button>
							<Button variant="outline" className="w-full" asChild>
								<Link to="/dashboard/services">Browse More Services</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/dashboard/services">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Book {service.name}</h1>
					<p className="text-gray-600">Complete your booking details below</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Service Details Sidebar */}
				<div className="lg:col-span-1">
					<Card className="sticky top-6">
						<CardHeader>
							<div className="flex justify-between items-start">
								<div>
									<CardTitle>{service.name}</CardTitle>
									<Badge variant="secondary" className="mt-2">
										{getServiceTypeDisplay((service as any).serviceType)}
									</Badge>
								</div>
								<div className="text-right">
									{isHourlyService ? (
										<div>
											<span className="text-2xl font-bold text-primary">{formatPrice(service.hourlyRate || 0)}</span>
											<span className="text-sm text-gray-600 block">per hour</span>
										</div>
									) : (
										<span className="text-2xl font-bold text-primary">{formatPrice(service.fixedPrice || 0)}</span>
									)}
								</div>
							</div>
							<CardDescription>{service.description}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Service Banner */}
							{service.bannerImageUrl && (
								<div className="h-40 rounded-lg overflow-hidden">
									<img 
										src={service.bannerImageUrl} 
										alt={service.name}
										className="w-full h-full object-cover"
									/>
								</div>
							)}

							{/* Service Details */}
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Clock className="h-4 w-4" />
									<span>{formatDuration(service.duration || 0)}</span>
								</div>
							</div>

							{/* Included Services */}
							<div>
								<h4 className="font-medium mb-2">What's Included</h4>
								<div className="space-y-1 text-sm text-gray-600">
									{service.includesDriver && <div>✓ Professional chauffeur</div>}
									{service.includesFuel && <div>✓ Fuel costs</div>}
									{service.includesTolls && <div>✓ Toll charges</div>}
									{service.includesWaiting && <div>✓ Waiting time ({service.waitingTimeMinutes}min)</div>}
								</div>
							</div>

							{/* Booking Requirements */}
							{service.advanceBookingHours && service.advanceBookingHours > 0 && (
								<div className="p-3 bg-yellow-50 rounded-lg">
									<div className="flex items-center gap-2">
										<AlertCircle className="h-4 w-4 text-yellow-600" />
										<span className="text-sm font-medium text-yellow-800">Advance Booking Required</span>
									</div>
									<p className="text-xs text-yellow-700 mt-1">
										Book at least {service.advanceBookingHours} hours in advance
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Booking Form */}
				<div className="lg:col-span-2 space-y-6">
					{/* Trip Details */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5" />
								Trip Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="originAddress">Pickup Location</Label>
									<Input
										id="originAddress"
										placeholder="Enter pickup address"
										value={formData.originAddress || ""}
										onChange={(e) => updateFormData("originAddress", e.target.value)}
										className={formErrors.originAddress ? "border-red-500" : ""}
									/>
									{formErrors.originAddress && (
										<p className="text-red-500 text-sm mt-1">{formErrors.originAddress}</p>
									)}
								</div>
								<div>
									<Label htmlFor="destinationAddress">Destination</Label>
									<Input
										id="destinationAddress"
										placeholder="Enter destination address"
										value={formData.destinationAddress || ""}
										onChange={(e) => updateFormData("destinationAddress", e.target.value)}
										className={formErrors.destinationAddress ? "border-red-500" : ""}
									/>
									{formErrors.destinationAddress && (
										<p className="text-red-500 text-sm mt-1">{formErrors.destinationAddress}</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Date & Time */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								Date & Time
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="scheduledPickupDate">Pickup Date</Label>
									<Input
										id="scheduledPickupDate"
										type="date"
										value={formData.scheduledPickupDate || ""}
										onChange={(e) => updateFormData("scheduledPickupDate", e.target.value)}
										min={new Date().toISOString().split('T')[0]}
										className={formErrors.scheduledPickupDate ? "border-red-500" : ""}
									/>
									{formErrors.scheduledPickupDate && (
										<p className="text-red-500 text-sm mt-1">{formErrors.scheduledPickupDate}</p>
									)}
								</div>
								<div>
									<Label htmlFor="scheduledPickupTime">Pickup Time</Label>
									<Input
										id="scheduledPickupTime"
										type="time"
										value={formData.scheduledPickupTime || ""}
										onChange={(e) => updateFormData("scheduledPickupTime", e.target.value)}
										className={formErrors.scheduledPickupTime ? "border-red-500" : ""}
									/>
									{formErrors.scheduledPickupTime && (
										<p className="text-red-500 text-sm mt-1">{formErrors.scheduledPickupTime}</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Passenger Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								Passenger Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="customerName">Full Name</Label>
									<Input
										id="customerName"
										placeholder="Enter your full name"
										value={formData.customerName || ""}
										onChange={(e) => updateFormData("customerName", e.target.value)}
										className={formErrors.customerName ? "border-red-500" : ""}
									/>
									{formErrors.customerName && (
										<p className="text-red-500 text-sm mt-1">{formErrors.customerName}</p>
									)}
								</div>
								<div>
									<Label htmlFor="passengerCount">Number of Passengers</Label>
									<Input
										id="passengerCount"
										type="number"
										min="1"
										max={service.maxPassengers || (isHourlyService ? 15 : 8)}
										value={formData.passengerCount || 1}
										onChange={(e) => updateFormData("passengerCount", parseInt(e.target.value) || 1)}
										className={formErrors.passengerCount ? "border-red-500" : ""}
									/>
									{formErrors.passengerCount && (
										<p className="text-red-500 text-sm mt-1">{formErrors.passengerCount}</p>
									)}
								</div>
								{isHourlyService && (
									<div>
										<Label htmlFor="serviceDuration">Service Duration (Hours)</Label>
										<Input
											id="serviceDuration"
											type="number"
											min="1"
											max="24"
											value={formData.serviceDuration || 1}
											onChange={(e) => updateFormData("serviceDuration", parseInt(e.target.value) || 1)}
											className={formErrors.serviceDuration ? "border-red-500" : ""}
										/>
										<p className="text-sm text-gray-600 mt-1">
											Rate: {formatPrice(service.hourlyRate || 0)} per hour
										</p>
										{formErrors.serviceDuration && (
											<p className="text-red-500 text-sm mt-1">{formErrors.serviceDuration}</p>
										)}
									</div>
								)}
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="customerPhone">Phone Number</Label>
									<Input
										id="customerPhone"
										type="tel"
										placeholder="Enter your phone number"
										value={formData.customerPhone || ""}
										onChange={(e) => updateFormData("customerPhone", e.target.value)}
										className={formErrors.customerPhone ? "border-red-500" : ""}
									/>
									{formErrors.customerPhone && (
										<p className="text-red-500 text-sm mt-1">{formErrors.customerPhone}</p>
									)}
								</div>
								<div>
									<Label htmlFor="customerEmail">Email Address</Label>
									<Input
										id="customerEmail"
										type="email"
										placeholder="Enter your email"
										value={formData.customerEmail || ""}
										onChange={(e) => updateFormData("customerEmail", e.target.value)}
										className={formErrors.customerEmail ? "border-red-500" : ""}
									/>
									{formErrors.customerEmail && (
										<p className="text-red-500 text-sm mt-1">{formErrors.customerEmail}</p>
									)}
								</div>
							</div>
							<div>
								<Label htmlFor="specialRequests">Special Requests (Optional)</Label>
								<Textarea
									id="specialRequests"
									placeholder="Any special requirements or requests..."
									value={formData.specialRequests || ""}
									onChange={(e) => updateFormData("specialRequests", e.target.value)}
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Book Service Button */}
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div>
									<div className="text-lg font-medium">Total Cost</div>
									<div className="text-sm text-gray-600">
										{isHourlyService ? (
											formData.serviceDuration
												? `${formData.serviceDuration} hour${formData.serviceDuration > 1 ? 's' : ''} @ ${formatPrice(service.hourlyRate || 0)}/hour`
												: "Select duration to see total"
										) : (
											"Fixed price for this service"
										)}
									</div>
								</div>
								<div className="text-3xl font-bold text-primary">{formatPrice(calculateTotalPrice())}</div>
							</div>
							<Button 
								className="w-full" 
								onClick={handleSubmit}
								disabled={createBookingMutation.isPending || !service || !user || !carsData?.data?.length}
							>
								{createBookingMutation.isPending ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Confirming Booking...
									</>
								) : (
									<>
										<Package className="h-4 w-4" />
										Confirm Booking
									</>
								)}
							</Button>
							
							{/* Debug/Help Messages */}
							{(!service || !user || !carsData?.data?.length) && !createBookingMutation.isPending && (
								<div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
									{!service && <div>⚠️ Service information is still loading...</div>}
									{!user && <div>⚠️ Please sign in to continue</div>}
									{!carsData?.data?.length && (
										<div>
											⚠️ No vehicles are currently available
											<div className="text-xs mt-1 text-yellow-600">
												Cars must be published and active to be available for booking
											</div>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
