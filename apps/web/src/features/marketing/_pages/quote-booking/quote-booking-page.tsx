import { useState, useEffect } from "react";
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
	AlertCircle,
	Car,
	Calculator,
	LogIn
} from "lucide-react";
import { toast } from "sonner";
import { Link, useSearch, useNavigate } from "@tanstack/react-router";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { queryClient } from "@/trpc";
import { useGetAvailableCarsQuery } from "@/features/customer/_hooks/query/use-get-available-cars-query";
import { useCreateCustomBookingFromQuoteMutation } from "@/features/marketing/_hooks/query/use-create-custom-booking-from-quote-mutation";
import { useGetSecureQuoteQuery } from "./_hooks/use-get-secure-quote-query";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";

// Booking form schema for quote-based booking
const QuoteBookingFormSchema = z.object({
	scheduledPickupDate: z.string({ required_error: "Please select a pickup date" }).min(1, "Please select a pickup date"),
	scheduledPickupTime: z.string({ required_error: "Please select a pickup time" }).min(1, "Please select a pickup time"),
	customerName: z.string({ required_error: "Please enter your full name" }).min(1, "Please enter your full name"),
	customerPhone: z.string({ required_error: "Please enter your phone number" }).min(1, "Please enter your phone number"),
	customerEmail: z.string({ required_error: "Please enter your email address" }).email("Please enter a valid email address"),
	passengerCount: z.number().min(1, "At least 1 passenger required"),
	specialRequests: z.string().optional(),
});

type QuoteBookingFormData = z.infer<typeof QuoteBookingFormSchema>;

interface QuoteBookingPageProps {
	isCustomerArea?: boolean;
	pathQuoteId?: string; // For customer routes that use path parameters
}

export function QuoteBookingPage({ isCustomerArea = false, pathQuoteId }: QuoteBookingPageProps) {
	const search = useSearch({ strict: false }) as any;
	const navigate = useNavigate();
	
	// Use user query for authenticated users only
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	
	// Fetch available cars
	const { data: carsData, isLoading: carsLoading, error: carsError } = useGetAvailableCarsQuery();
	
	// Get quote ID from either path parameter (customer routes) or search parameter (public routes)
	const quoteId = pathQuoteId || search?.quoteId || "";
	
	// Fetch secure quote if quoteId is provided
	const { data: secureQuoteData, isLoading: secureQuoteLoading, error: secureQuoteError } = useGetSecureQuoteQuery(
		quoteId,
		{ enabled: !!quoteId }
	);
	
	// Mutation for creating booking from quote
	const createBookingMutation = useCreateCustomBookingFromQuoteMutation();
	
	// Form state - pre-populate for authenticated users
	const [formData, setFormData] = useState<Partial<QuoteBookingFormData>>({
		passengerCount: 1,
	});
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [step, setStep] = useState<"details" | "booking" | "confirmation">("details");
	const [selectedCarId, setSelectedCarId] = useState<string>("");

	// Pre-populate form data for authenticated users
	useEffect(() => {
		if (sessionData?.user) {
			setFormData(prev => ({
				...prev,
				customerName: prev.customerName || sessionData.user.name || "",
				customerEmail: prev.customerEmail || sessionData.user.email || "",
			}));
		}
	}, [sessionData]);

	// Extract quote data - prioritize secure quote, fallback to URL params
	const quoteData = secureQuoteData ? {
		origin: secureQuoteData.originAddress,
		destination: secureQuoteData.destinationAddress,
		distance: (secureQuoteData.estimatedDistance || 0) / 1000, // Convert meters to km
		duration: Math.round((secureQuoteData.estimatedDuration || 0) / 60), // Convert seconds to minutes
		totalFare: secureQuoteData.totalAmount || 0,
		carId: secureQuoteData.carId, // Pre-selected car from quote
	} : {
		origin: search?.origin || "",
		destination: search?.destination || "",
		distance: parseFloat(search?.distance || "0"),
		duration: parseInt(search?.duration || "0"),
		totalFare: parseFloat(search?.totalFare || "0"),
		carId: search?.carId, // Pre-selected car from legacy URL
	};


	// Pre-select car from quote data
	useEffect(() => {
		if (quoteData.carId && carsData?.data && !selectedCarId) {
			const carExists = carsData.data.find(car => car.id === quoteData.carId);
			if (carExists) {
				console.log("🚗 Pre-selecting car from quote:", quoteData.carId);
				setSelectedCarId(quoteData.carId);
			}
		}
	}, [quoteData.carId, carsData?.data, selectedCarId]);

	console.log("🔍 QUOTE BOOKING DEBUG:");
	console.log("Path Quote ID:", pathQuoteId);
	console.log("Search params:", search);
	console.log("Combined Quote ID:", quoteId);
	console.log("Secure quote data:", secureQuoteData);
	console.log("Secure quote data breakdown:", secureQuoteData?.breakdown);
	console.log("Secure quote error:", secureQuoteError);
	console.log("Secure quote loading:", secureQuoteLoading);
	console.log("Quote data:", quoteData);
	console.log("Session data:", sessionData);
	console.log("Cars data:", carsData);
	console.log("Selected car ID:", selectedCarId);


	const updateFormData = (field: keyof QuoteBookingFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		try {
			console.log("🔍 Validating quote booking form data:", formData);
			
			// Ensure all fields have default values to avoid undefined errors
			const cleanedFormData = {
				scheduledPickupDate: formData.scheduledPickupDate || "",
				scheduledPickupTime: formData.scheduledPickupTime || "",
				customerName: formData.customerName || "",
				customerPhone: formData.customerPhone || "",
				customerEmail: formData.customerEmail || "",
				passengerCount: formData.passengerCount || 1,
				specialRequests: formData.specialRequests || "",
			};
			
			QuoteBookingFormSchema.parse(cleanedFormData);
			console.log("✅ Quote booking form validation passed");
			setFormErrors({});
			return true;
		} catch (error) {
			console.log("❌ Quote booking form validation failed:", error);
			if (error instanceof z.ZodError) {
				const errors: Record<string, string> = {};
				error.issues.forEach((err) => {
					if (err.path.length > 0) {
						errors[err.path[0] as string] = err.message;
					}
				});
				setFormErrors(errors);
				console.log("Quote booking form errors:", errors);
			}
			return false;
		}
	};

	const handleSubmit = async () => {
		console.log("🚀 Starting quote-based booking submission...");
		
		if (!validateForm()) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (!selectedCarId) {
			toast.error("Please select a vehicle");
			return;
		}

		// Only authenticated users can book - require session
		if (!sessionData?.user) {
			toast.error("Please sign in to complete your booking.");
			navigate({ to: "/sign-in" });
			return;
		}

		const effectiveUserInfo = {
			id: sessionData.user.id,
			name: sessionData.user.name || formData.customerName || 'User',
			email: sessionData.user.email || formData.customerEmail || '',
			isGuest: false,
		};

		console.log("👤 User info for booking:", effectiveUserInfo);

		if (!quoteData.origin || !quoteData.destination) {
			toast.error("Quote information is missing. Please start a new quote.");
			return;
		}

		try {
			// Create proper Date object from date and time inputs
			const scheduledPickupTime = new Date(`${formData.scheduledPickupDate}T${formData.scheduledPickupTime}:00.000Z`);
			
			// Validate that the date is valid
			if (isNaN(scheduledPickupTime.getTime())) {
				toast.error("Invalid pickup date or time");
				return;
			}
			
			// Use simplified pricing from secure quote data if available
			const firstKmFareAmount = secureQuoteData?.firstKmFare || quoteData.totalFare * 0.7;
			const additionalKmFareAmount = secureQuoteData?.additionalKmFare || quoteData.totalFare * 0.3;
			const quotedAmount = Math.round(quoteData.totalFare * 100); // Convert to cents
			
			const bookingPayload = {
				userId: effectiveUserInfo.id,
				originAddress: quoteData.origin,
				destinationAddress: quoteData.destination,
				scheduledPickupTime: scheduledPickupTime.toISOString(),
				estimatedDuration: quoteData.duration * 60, // Convert minutes to seconds
				estimatedDistance: quoteData.distance * 1000, // Convert km to meters
				// Map new pricing structure to existing database fields
				baseFare: Math.round(firstKmFareAmount * 100), // Convert to cents
				distanceFare: Math.round(additionalKmFareAmount * 100), // Convert to cents
				timeFare: 0, // Not used in simplified pricing
				extraCharges: 0,
				quotedAmount,
				customerName: formData.customerName!,
				customerPhone: formData.customerPhone!,
				customerEmail: formData.customerEmail!,
				passengerCount: formData.passengerCount!,
				specialRequests: formData.specialRequests,
				preferredCategoryId: carsData?.data?.find(car => car.id === selectedCarId)?.category?.id,
			};

			console.log("📦 Quote booking payload:", bookingPayload);

			// Use the mutation hook to create booking
			const result = await createBookingMutation.mutateAsync(bookingPayload);
			
			console.log("✅ Quote booking successful:", result);
			setStep("confirmation");
		} catch (error) {
			console.error("❌ Quote booking failed:", error);
		}
	};

	// Show loading state while session or secure quote is being loaded
	if (sessionLoading || secureQuoteLoading) {
		return (
			<div className="flex justify-center items-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-gray-600">
					{sessionLoading ? "Setting up session..." : "Loading quote details..."}
				</span>
			</div>
		);
	}

	// Check authentication requirement for users with valid quote data
	// If user has quote data but is not authenticated, redirect to sign-in
	if (!sessionLoading && !sessionData?.user && (secureQuoteData || (quoteData.origin && quoteData.destination && quoteData.totalFare))) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-2xl mx-auto text-center space-y-6">
						{/* Authentication Required Card */}
						<Card className="border-blue-200 bg-blue-50">
							<CardContent className="p-8">
								<div className="space-y-4">
									<div>
										<h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h2>
										<p className="text-gray-600">
											Please sign in to your account to complete your booking. This helps us provide better service and manage your reservations.
										</p>
									</div>
									
									{/* Selected Car */}
									{quoteData.carId && carsData?.data && (() => {
										const selectedCar = carsData.data.find(car => car.id === quoteData.carId);
										return selectedCar ? (
											<div className="bg-white rounded-lg p-4 border text-left">
												<h3 className="font-medium text-gray-900 mb-3 text-center">Selected Vehicle</h3>
												<div className="flex items-center gap-3">
													{selectedCar.images && selectedCar.images.length > 0 && (
														<img
															src={selectedCar.images.find(img => img.isMain)?.url || selectedCar.images[0].url}
															alt={selectedCar.name}
															className="w-16 h-12 object-cover rounded border"
														/>
													)}
													<div className="flex-1 min-w-0">
														<div className="font-medium text-sm text-gray-900">
															{selectedCar.name}
														</div>
														<div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
															<span className="flex items-center gap-1">
																<Users className="h-3 w-3" />
																{selectedCar.seatingCapacity} seats
															</span>
															<span>{selectedCar.category?.name}</span>
															<span>{selectedCar.fuelType?.name}</span>
														</div>
													</div>
												</div>
											</div>
										) : null;
									})()}

									{/* Quote Summary with Fare Breakdown */}
									{(secureQuoteData || quoteData.origin) && (
										<div className="bg-white rounded-lg p-4 border text-left">
											<h3 className="font-medium text-gray-900 mb-3 text-center">Your Quote Summary</h3>
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-gray-600">From:</span>
													<span className="font-medium truncate ml-2">{secureQuoteData?.originAddress || quoteData.origin}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-gray-600">To:</span>
													<span className="font-medium truncate ml-2">{secureQuoteData?.destinationAddress || quoteData.destination}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-gray-600">Distance:</span>
													<span className="font-medium">{quoteData.distance.toFixed(1)} km</span>
												</div>
												<div className="flex justify-between">
													<span className="text-gray-600">Duration:</span>
													<span className="font-medium">{quoteData.duration} min</span>
												</div>
												
												{/* Fare Breakdown */}
												{(secureQuoteData?.firstKmFare || secureQuoteData?.additionalKmFare) && (
													<>
														<div className="border-t pt-2 mt-2">
															<div className="text-xs font-medium text-gray-700 mb-2">Fare Breakdown:</div>
															<div className="space-y-1">
																{secureQuoteData?.firstKmFare && (
																	<div className="flex justify-between text-xs">
																		<span className="text-gray-500">First {Math.ceil(secureQuoteData.breakdown?.firstKmDistance || 10)}km (Flat Rate):</span>
																		<span>${secureQuoteData.firstKmFare.toFixed(2)}</span>
																	</div>
																)}
																{secureQuoteData?.additionalKmFare && secureQuoteData.additionalKmFare > 0 && (
																	<div className="flex justify-between text-xs">
																		<span className="text-gray-500">Additional {secureQuoteData.breakdown?.additionalDistance?.toFixed(1) || 0}km:</span>
																		<span>${secureQuoteData.additionalKmFare.toFixed(2)}</span>
																	</div>
																)}
																{secureQuoteData?.extraCharges && secureQuoteData.extraCharges > 0 && (
																	<div className="flex justify-between text-xs">
																		<span className="text-gray-500">Additional charges:</span>
																		<span>${secureQuoteData.extraCharges.toFixed(2)}</span>
																	</div>
																)}
															</div>
														</div>
													</>
												)}
												
												<div className="flex justify-between border-t pt-2 text-base">
													<span className="font-medium text-gray-900">Total Fare:</span>
													<span className="font-bold text-primary">${quoteData.totalFare.toFixed(2)}</span>
												</div>
											</div>
										</div>
									)}
									
									<div className="space-y-3">
										<Button 
											className="w-full h-12 text-base font-semibold" 
											onClick={() => {
												// Preserve the current URL for redirect after sign-in
												const currentPath = window.location.pathname + window.location.search;
												navigate({
													to: "/sign-in",
													search: { redirect: currentPath }
												});
											}}
										>
											<LogIn className="mr-2 h-5 w-5" />
											Sign In to Continue
										</Button>
										
										<Button 
											variant="outline" 
											className="w-full"
											onClick={() => {
												const currentPath = window.location.pathname + window.location.search;
												navigate({
													to: "/sign-up",
													search: { redirect: currentPath }
												});
											}}
										>
											Create New Account
										</Button>
										
										<Button 
											variant="ghost" 
											className="w-full text-sm"
											onClick={() => navigate({ to: "/" })}
										>
											Get New Quote
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
						
						{/* Benefits of Creating Account */}
						<Card>
							<CardContent className="p-6">
								<h3 className="font-medium text-gray-900 mb-3">Why create an account?</h3>
								<ul className="text-sm text-gray-600 space-y-1 text-left">
									<li>• Track and manage your bookings</li>
									<li>• Faster checkout for future bookings</li>
									<li>• Access to booking history</li>
									<li>• Priority customer support</li>
									<li>• Exclusive member offers</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	// Handle secure quote errors
	if (search?.quoteId && secureQuoteError) {
		return (
			<div className="text-center py-12">
				<AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
				<h3 className="text-lg font-medium text-gray-900 mb-2">Quote Expired or Invalid</h3>
				<p className="text-gray-600 mb-4">Your quote has expired or could not be found. Please generate a new quote to continue.</p>
				<Button asChild>
					<Link to="/">Get New Quote</Link>
				</Button>
			</div>
		);
	}

	// Check if we have valid quote data
	if (!quoteData.origin || !quoteData.destination || !quoteData.totalFare) {
		return (
			<div className="text-center py-12">
				<Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
				<h3 className="text-lg font-medium text-gray-900 mb-2">No quote information found</h3>
				<p className="text-gray-600 mb-4">Please start a new instant quote to proceed with booking</p>
				<Button asChild>
					<Link to="/">Get New Quote</Link>
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
						<p className="text-gray-600">Your custom booking has been submitted successfully</p>
						{!sessionData?.user && (
							<p className="text-sm text-blue-600 mt-2">
								💡 Tip: Create an account to easily manage your bookings
							</p>
						)}
					</div>
				</div>

				{/* Booking Details */}
				<Card>
					<CardHeader>
						<CardTitle>Booking Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h4 className="font-medium">Custom Journey</h4>
							<p className="text-sm text-gray-600">Based on your instant quote</p>
						</div>
						<Separator />
						
						{/* Enhanced Route Display for Confirmation */}
						<div className="p-3 bg-gradient-to-r from-green-50 to-red-50 rounded-lg border border-gray-200">
							{/* Mobile - Vertical Stack */}
							<div className="sm:hidden space-y-3">
								{/* Origin */}
								<div className="flex items-start gap-3">
									<div className="relative mt-0.5">
										<div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm flex-shrink-0" />
										<div className="absolute left-1/2 top-3 w-px h-4 bg-gradient-to-b from-green-500 to-red-500 transform -translate-x-1/2"></div>
									</div>
									<div className="min-w-0 flex-1">
										<div className="text-xs text-gray-500">From</div>
										<div className="font-medium text-sm leading-tight break-words">{quoteData.origin}</div>
									</div>
								</div>
								
								{/* Destination */}
								<div className="flex items-start gap-3">
									<div className="relative mt-0.5">
										<div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm flex-shrink-0" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="text-xs text-gray-500">To</div>
										<div className="font-medium text-sm leading-tight break-words">{quoteData.destination}</div>
									</div>
								</div>
							</div>
							
							{/* Desktop - Horizontal Layout */}
							<div className="hidden sm:flex items-center justify-between gap-4">
								{/* Origin */}
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm flex-shrink-0" />
									<div className="min-w-0 flex-1">
										<div className="text-xs text-gray-500">From</div>
										<div className="font-medium text-sm truncate">{quoteData.origin}</div>
									</div>
								</div>
								
								{/* Route Connector */}
								<div className="flex items-center gap-1 flex-shrink-0">
									<div className="w-4 h-px bg-gradient-to-r from-green-500 to-red-500"></div>
									<div className="w-1.5 h-1.5 border-t border-r border-red-500 transform rotate-45"></div>
								</div>
								
								{/* Destination */}
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm flex-shrink-0" />
									<div className="min-w-0 flex-1">
										<div className="text-xs text-gray-500">To</div>
										<div className="font-medium text-sm truncate">{quoteData.destination}</div>
									</div>
								</div>
							</div>
						</div>
						
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-gray-600">Date & Time:</span>
								<p className="font-medium">{formData.scheduledPickupDate} at {formData.scheduledPickupTime}</p>
							</div>
							<div>
								<span className="text-gray-600">Passengers:</span>
								<p className="font-medium">{formData.passengerCount} passenger{formData.passengerCount !== 1 ? 's' : ''}</p>
							</div>
							<div>
								<span className="text-gray-600">Distance:</span>
								<p className="font-medium">{quoteData.distance.toFixed(1)} km</p>
							</div>
							<div>
								<span className="text-gray-600">Estimated Fare:</span>
								<p className="font-medium text-primary">${quoteData.totalFare.toFixed(2)}</p>
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
							{sessionData?.user ? (
								<>
									<Button className="w-full" asChild>
										<Link to="/my-bookings">View My Bookings</Link>
									</Button>
									<Button variant="outline" className="w-full" asChild>
										<Link to="/">Get Another Quote</Link>
									</Button>
								</>
							) : (
								<>
									<Button className="w-full" asChild>
										<Link to="/sign-up">Create Account to Track Bookings</Link>
									</Button>
									<Button variant="outline" className="w-full" asChild>
										<Link to="/">Get Another Quote</Link>
									</Button>
								</>
							)}
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
					<Link to="/">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
					<p className="text-gray-600">
						Based on your instant quote
						{!sessionData?.user && <span className="text-blue-600"> (Anonymous booking)</span>}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Quote Details Sidebar */}
				<div className="lg:col-span-1">
					<Card className="sticky top-6">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calculator className="h-5 w-5" />
								Your Quote
							</CardTitle>
							<CardDescription>Instant quote details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Enhanced Route Details */}
							<div className="relative p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
								<div className="space-y-3">
									{/* Origin */}
									<div className="flex items-center gap-3 text-sm">
										<div className="relative">
											<div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm flex-shrink-0" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-gray-900">From</div>
											<div className="text-gray-600 truncate">{quoteData.origin}</div>
										</div>
									</div>

									{/* Route Connection Line */}
									<div className="ml-2 flex items-center gap-2">
										<div className="w-px h-4 bg-gradient-to-b from-green-500 to-red-500" />
										<div className="flex-1 h-px bg-gradient-to-r from-green-500/30 to-red-500/30" />
										<div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
									</div>

									{/* Destination */}
									<div className="flex items-center gap-3 text-sm">
										<div className="relative">
											<div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm flex-shrink-0" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-gray-900">To</div>
											<div className="text-gray-600 truncate">{quoteData.destination}</div>
										</div>
									</div>
								</div>
								
								{/* Route Status Indicator */}
								<div className="absolute top-1 right-1">
									<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
								</div>
							</div>

							<Separator />

							{/* Journey Stats */}
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Distance:</span>
									<span className="font-medium">{quoteData.distance.toFixed(1)} km</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Duration:</span>
									<span className="font-medium">{quoteData.duration} min</span>
								</div>
							</div>

							<Separator />

							{/* Estimated Fare */}
							<div className="text-center p-3 bg-primary/10 rounded-lg">
								<div className="text-sm text-gray-600 mb-1">Estimated Fare</div>
								<div className="text-2xl font-bold text-primary">${quoteData.totalFare.toFixed(2)}</div>
								<div className="text-xs text-gray-500">*Price based on instant quote</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Booking Form */}
				<div className="lg:col-span-2 space-y-6">
					{/* Vehicle Selection */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Car className="h-5 w-5" />
								Select Vehicle
							</CardTitle>
						</CardHeader>
						<CardContent>
							{carsLoading ? (
								<div className="text-center py-8">
									<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
									<p className="text-gray-600">Loading available vehicles...</p>
								</div>
							) : carsError || !carsData?.data?.length ? (
								<div className="text-center py-8">
									<AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
									<p className="text-gray-600">No vehicles currently available</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{carsData.data.map((car) => (
										<div 
											key={car.id}
											className={`p-4 border rounded-lg cursor-pointer transition-colors ${
												selectedCarId === car.id 
													? "border-primary bg-primary/5" 
													: "border-gray-200 hover:border-gray-300"
											}`}
											onClick={() => setSelectedCarId(car.id)}
										>
											{car.images && car.images.length > 0 && (
												<img 
													src={typeof car.images[0] === 'string' ? car.images[0] : car.images[0].url} 
													alt={`${car.model?.brand?.name || ''} ${car.model?.name || ''}`}
													className="w-full h-32 object-cover rounded-lg mb-3"
												/>
											)}
											<h4 className="font-medium">
												{car.model?.brand?.name || 'Unknown'} {car.model?.name || 'Model'}
											</h4>
											<p className="text-sm text-gray-600">{car.category?.name || 'Standard'}</p>
											<div className="flex items-center gap-2 mt-2">
												<Users className="h-4 w-4 text-gray-400" />
												<span className="text-sm">{car.seatingCapacity} seats</span>
											</div>
										</div>
									))}
								</div>
							)}
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
										max="8"
										value={formData.passengerCount || 1}
										onChange={(e) => updateFormData("passengerCount", parseInt(e.target.value) || 1)}
										className={formErrors.passengerCount ? "border-red-500" : ""}
									/>
									{formErrors.passengerCount && (
										<p className="text-red-500 text-sm mt-1">{formErrors.passengerCount}</p>
									)}
								</div>
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

					{/* Confirm Booking Button */}
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div>
									<div className="text-lg font-medium">Estimated Cost</div>
									<div className="text-sm text-gray-600">Based on your instant quote</div>
								</div>
								<div className="text-3xl font-bold text-primary">${quoteData.totalFare.toFixed(2)}</div>
							</div>
							
							{/* Fare Breakdown */}
							{secureQuoteData && (
								<div className="mb-4 p-3 bg-gray-50 rounded-lg">
									<div className="text-sm font-medium text-gray-700 mb-2">Fare Breakdown:</div>
									<div className="space-y-1">
										{(secureQuoteData.firstKmFare || secureQuoteData.baseFare) && (
											<div className="flex justify-between text-sm">
												<span className="text-gray-600">First {quoteData.breakdown?.firstKmLimit || 10} km:</span>
												<span>${((secureQuoteData.firstKmFare || secureQuoteData.baseFare || 0) / 100).toFixed(2)}</span>
											</div>
										)}
										{((secureQuoteData.additionalKmFare || secureQuoteData.distanceFare) && (secureQuoteData.additionalKmFare || secureQuoteData.distanceFare) > 0) && (
											<div className="flex justify-between text-sm">
												<span className="text-gray-600">Additional distance:</span>
												<span>${((secureQuoteData.additionalKmFare || secureQuoteData.distanceFare || 0) / 100).toFixed(2)}</span>
											</div>
										)}
										{secureQuoteData.breakdown?.surgePricing && secureQuoteData.breakdown.surgePricing > 1 && (
											<div className="flex justify-between text-sm text-orange-600">
												<span>Peak time surcharge ({((secureQuoteData.breakdown.surgePricing - 1) * 100).toFixed(0)}%):</span>
												<span>Applied</span>
											</div>
										)}
									</div>
								</div>
							)}
							<Button 
								className="w-full" 
								onClick={handleSubmit}
								disabled={createBookingMutation.isPending || !selectedCarId}
							>
								{createBookingMutation.isPending ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Confirming Booking...
									</>
								) : (
									<>
										<Package className="h-4 w-4" />
										{sessionData?.user && isCustomerArea
											? "Book"
											: "Confirm Booking"
										}
									</>
								)}
							</Button>
							
							{/* Help Messages */}
							{(!selectedCarId || createBookingMutation.isPending) && (
								<div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
									{!selectedCarId && <div>⚠️ Please select a vehicle to continue</div>}
									{createBookingMutation.isPending && <div>📤 Processing your booking...</div>}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}