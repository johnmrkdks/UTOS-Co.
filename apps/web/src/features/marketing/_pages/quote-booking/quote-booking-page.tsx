import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { DateTimePicker } from "@/components/date-time-picker";
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
	LogIn,
	Navigation,
	CircleDot,
	MapPinned
} from "lucide-react";
import { toast } from "sonner";
import { Link, useSearch, useNavigate } from "@tanstack/react-router";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { queryClient } from "@/trpc";
import { useCreateCustomBookingFromQuoteMutation } from "@/features/marketing/_hooks/query/use-create-custom-booking-from-quote-mutation";
import { useGetSecureQuoteQuery } from "./_hooks/use-get-secure-quote-query";
import { useGetCarQuery } from "@/features/customer/_hooks/query/use-get-car-query";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";
import { createLocalDateForBackend } from "@/utils/timezone";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

// Create dynamic booking form schema based on car capacity
const createQuoteBookingFormSchema = (maxPassengers?: number, maxLuggage?: number) => z.object({
	scheduledPickupDate: z.string().min(1, "Please select a pickup date"),
	scheduledPickupTime: z.string().min(1, "Please select a pickup time"),
	customerName: z.string().min(1, "Please enter your full name"),
	customerPhone: z.string().min(1, "Please enter your phone number"),
	customerEmail: z.string().email("Please enter a valid email address"),
	passengerCount: z.number()
		.min(1, "At least 1 passenger required")
		.max(maxPassengers || 8, `Maximum ${maxPassengers || 8} passengers allowed for this vehicle`),
	luggageCount: z.number()
		.min(0, "Luggage count cannot be negative")
		.max(maxLuggage || 10, `Maximum ${maxLuggage || 10} pieces of luggage allowed for this vehicle`),
	specialRequests: z.string().optional(),
});

type QuoteBookingFormData = z.infer<ReturnType<typeof createQuoteBookingFormSchema>>;

interface QuoteBookingPageProps {
	isCustomerArea?: boolean;
	pathQuoteId?: string; // For customer routes that use path parameters
}

export function QuoteBookingPage({ isCustomerArea = false, pathQuoteId }: QuoteBookingPageProps) {
	const search = useSearch({ strict: false }) as any;
	const navigate = useNavigate();

	// Scroll to top functionality
	const scrollContainerRef = useScrollToTop({ behavior: "smooth", disabled: true });


	// Use user query for authenticated users only
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();


	// Get quote ID from either path parameter (customer routes) or search parameter (public routes)
	const quoteId = pathQuoteId || search?.quoteId || "";

	// Fetch secure quote if quoteId is provided
	const { data: secureQuoteData, isLoading: secureQuoteLoading, error: secureQuoteError } = useGetSecureQuoteQuery(
		quoteId,
		{ enabled: !!quoteId }
	);

	// Enhanced debugging for quote data
	console.log("🔍 Quote debugging:");
	console.log("- quoteId:", quoteId);
	console.log("- secureQuoteLoading:", secureQuoteLoading);
	console.log("- secureQuoteError:", secureQuoteError);
	console.log("- secureQuoteData:", secureQuoteData);

	// Mutation for creating booking from quote
	const createBookingMutation = useCreateCustomBookingFromQuoteMutation();
	
	// Get car details if carId is available in quote data
	const carId = (secureQuoteData?.carId) || (search?.carId) || "";
	console.log("🚗 Car debugging:");
	console.log("- carId from quote:", secureQuoteData?.carId);
	console.log("- carId from search:", search?.carId);
	console.log("- final carId:", carId);
	console.log("- carId enabled?", !!carId);

	const { data: carData, isLoading: carLoading, error: carError } = useGetCarQuery(
		{ id: carId },
		{ enabled: !!carId }
	);

	// Enhanced car debugging
	console.log("🚗 Car query status:");
	console.log("- carLoading:", carLoading);
	console.log("- carError:", carError);
	console.log("- carData:", carData);

	if (carData) {
		console.log("🚗 Car capacity details:", {
			name: carData.name,
			seatingCapacity: carData.seatingCapacity,
			maxPassengers: carData.seatingCapacity || 8,
			luggageCapacity: carData.luggageCapacity,
			isPublished: carData.isPublished,
			isActive: carData.isActive,
			isAvailable: carData.isAvailable
		});
	}
	if (carError) {
		console.error("❌ Car loading error details:", {
			message: carError.message,
			data: carError.data,
			shape: carError.shape
		});
	}

	// Form state - pre-populate for authenticated users
	const [formData, setFormData] = useState<Partial<QuoteBookingFormData>>({});
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [step, setStep] = useState<"details" | "booking" | "confirmation">("details");
	const [date, setDate] = useState<Date>();

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
				passengerCount: formData.passengerCount, // No fallback - make it required
				luggageCount: formData.luggageCount, // No fallback - make it required
				specialRequests: formData.specialRequests || "",
			};

			// Create dynamic schema based on car capacity
			console.log("🔧 Creating schema with capacity:", {
				seatingCapacity: carData?.seatingCapacity,
				luggageCapacity: carData?.luggageCapacity,
				carDataAvailable: !!carData
			});

		const QuoteBookingFormSchema = createQuoteBookingFormSchema(
			carData?.seatingCapacity || undefined,
			carData?.luggageCapacity || undefined
		);

		console.log("✅ Schema created, validating form data:", cleanedFormData);
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

		// Car is already selected from the quote, use the pre-selected car
		const preselectedCarId = quoteData.carId;

		// Only authenticated users can book - require session
		if (!sessionData?.user) {
			toast.error("Please sign in to complete your booking.");
			navigate({ to: "/sign-in", resetScroll: true });
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
			// Use simplified pricing from secure quote data if available
			const firstKmFareAmount = secureQuoteData?.firstKmFare || quoteData.totalFare * 0.7;
			const additionalKmFareAmount = secureQuoteData?.additionalKmFare || quoteData.totalFare * 0.3;
			const quotedAmount = quoteData.totalFare; // Store as dollar amount


			const bookingPayload = {
				userId: effectiveUserInfo.id,
				originAddress: quoteData.origin,
				destinationAddress: quoteData.destination,
				// Include stops from the secure quote data
				stops: secureQuoteData?.stops ? secureQuoteData.stops.map((stop: any, index: number) => ({
					address: stop.address,
					latitude: stop.latitude,
					longitude: stop.longitude,
					stopOrder: index + 1, // Add required stopOrder field
					waitingTime: 0, // Default waiting time
					notes: stop.notes || undefined, // Optional notes
				})) : [],
				scheduledPickupTime: createLocalDateForBackend(formData.scheduledPickupDate!, formData.scheduledPickupTime!),
				estimatedDuration: quoteData.duration * 60, // Convert minutes to seconds
				estimatedDistance: quoteData.distance * 1000, // Convert km to meters
				// Map new pricing structure to existing database fields
				baseFare: firstKmFareAmount, // Store as dollar amount
				distanceFare: additionalKmFareAmount, // Store as dollar amount
				timeFare: 0, // Not used in simplified pricing
				extraCharges: 0,
				quotedAmount,
				customerName: formData.customerName!,
				customerPhone: formData.customerPhone!,
				customerEmail: formData.customerEmail!,
				passengerCount: formData.passengerCount!,
				luggageCount: formData.luggageCount!,
				specialRequests: formData.specialRequests,
				preferredCategoryId: preselectedCarId,
			};

			console.log("📦 Quote booking payload:", bookingPayload);

			// Use the mutation hook to create booking
			const result = await createBookingMutation.mutateAsync(bookingPayload);

			console.log("✅ Quote booking successful:", result);
			setStep("confirmation");

			// Scroll to top after confirmation
			setTimeout(() => {
				if (scrollContainerRef.current) {
					scrollContainerRef.current.scrollTo({
						top: 0,
						behavior: "smooth"
					});
				} else {
					// Fallback to window scroll if container ref not found
					window.scrollTo({
						top: 0,
						behavior: "smooth"
					});
				}
			}, 100);
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
				<div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
					<div className="max-w-2xl mx-auto text-center space-y-4 sm:space-y-6">
						{/* Authentication Required Card */}
						<Card className="border-blue-200 bg-blue-50">
							<CardContent className="p-4 sm:p-8">
								<div className="space-y-3 sm:space-y-4">
									<div>
										<h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Complete Your Chauffeur Booking</h2>
										<p className="text-sm sm:text-base text-gray-600">
											Please sign in to your account to complete your booking. This helps us provide better service and manage your reservations.
										</p>
									</div>

										{/* Selected Car */}
										{carId && (
											<div className="bg-white rounded-lg p-3 sm:p-4 border text-left">
												<h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-center text-sm sm:text-base">Pre-selected Vehicle</h3>
											<div className="flex items-center gap-2 sm:gap-3">
												<div className="w-12 h-10 sm:w-16 sm:h-12 bg-primary/10 rounded border flex items-center justify-center flex-shrink-0">
													<Car className="w-4 h-4 sm:w-6 sm:h-6 text-primary/60" />
												</div>
												<div className="flex-1 min-w-0">
													{carLoading ? (
														<>
															<div className="font-medium text-sm text-gray-900">
																Loading vehicle details...
															</div>
															<div className="text-xs text-muted-foreground mt-1">
																Please wait
															</div>
														</>
													) : carError ? (
														<>
															<div className="font-medium text-sm text-orange-900">
																Vehicle details unavailable
															</div>
															<div className="text-xs text-orange-600 mt-1">
																Using standard capacity limits (8 passengers, 10 luggage)
															</div>
														</>
													) : carData ? (
														<>
															<div className="font-medium text-xs sm:text-sm text-gray-900 truncate">
																{carData.name}
															</div>
															<div className="text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
																{carData.category?.name || 'Premium Vehicle'}
															</div>
															{carData.features && carData.features.length > 0 && (
																<div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
																	{carData.features.slice(0, 2).map((feature: any) => (
																		<Badge key={feature.id} variant="secondary" className="text-xs px-1.5 py-0.5">
																			{feature.name}
																		</Badge>
																	))}
																	{carData.features.length > 2 && (
																		<Badge variant="secondary" className="text-xs px-1.5 py-0.5">
																			+{carData.features.length - 2} more
																		</Badge>
																	)}
																</div>
															)}
														</>
													) : (
														<>
															<div className="font-medium text-sm text-gray-900">
																Vehicle from your quote
															</div>
															<div className="text-xs text-muted-foreground mt-1">
																Using standard capacity limits (8 passengers, 10 luggage)
															</div>
														</>
													)}
												</div>
											</div>
										</div>
									)}

									{/* Quote Summary with Fare Breakdown */}
									{(secureQuoteData || quoteData.origin) && (
										<div className="bg-white rounded-lg p-3 sm:p-4 border text-left w-full">
											<h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-center text-sm sm:text-base">Your Quote Summary</h3>
											<div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
												{/* From */}
												<div className="flex items-start gap-2 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
													<div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
														<Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
													</div>
													<div className="flex-1 min-w-0">
														<span className="text-xs text-green-700 font-medium block">Pickup</span>
														<div className="text-xs sm:text-sm font-medium text-gray-800 break-words leading-tight mt-0.5">{secureQuoteData?.originAddress || quoteData.origin}</div>
													</div>
												</div>

												{/* Stops (if any) */}
												{secureQuoteData?.stops && secureQuoteData.stops.length > 0 && (
													<>
														{secureQuoteData.stops.map((stop: any, index: number) => (
															<div key={stop.id || index} className="flex items-start gap-2 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
																<div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
																	<CircleDot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
																</div>
																<div className="flex-1 min-w-0">
																	<span className="text-xs text-blue-700 font-medium block">Stop {index + 1}</span>
																	<div className="text-xs sm:text-sm font-medium text-gray-800 break-words leading-tight mt-0.5">{stop.address}</div>
																</div>
															</div>
														))}
													</>
												)}

												{/* To */}
												<div className="flex items-start gap-2 p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
													<div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
														<MapPinned className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
													</div>
													<div className="flex-1 min-w-0">
														<span className="text-xs text-red-700 font-medium block">Drop-off</span>
														<div className="text-xs sm:text-sm font-medium text-gray-800 break-words leading-tight mt-0.5">{secureQuoteData?.destinationAddress || quoteData.destination}</div>
													</div>
												</div>

												{/* Journey Details */}
												<div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200">
													<div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
														<Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
													</div>
													<div className="flex-1">
														<span className="text-xs text-purple-700 font-medium block">Journey</span>
														<div className="text-xs sm:text-sm font-medium text-gray-800 mt-0.5">{quoteData.distance.toFixed(1)} km • {quoteData.duration} min</div>
													</div>
												</div>
											</div>

											<div>
												{/* Fare Breakdown */}
												{(secureQuoteData?.firstKmFare || secureQuoteData?.additionalKmFare) && (
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
													search: { redirect: currentPath },
													resetScroll: true
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
													search: { redirect: currentPath },
													resetScroll: true
												});
											}}
										>
											Create New Account
										</Button>

										<Button
											variant="ghost"
											className="w-full text-sm"
											onClick={() => navigate({ to: "/", resetScroll: true })}
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
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
					<div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
						{/* Header */}
						<div className="text-center space-y-3 sm:space-y-4">
							<CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto" />
							<div>
								<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
								<p className="text-sm sm:text-base text-gray-600">Your custom booking has been submitted successfully</p>
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
								<CardTitle className="text-lg sm:text-xl">Booking Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 sm:space-y-4">
						<div>
							<h4 className="font-medium">Chauffeur Journey</h4>
							<p className="text-sm text-gray-600">Based on your instant quote</p>
						</div>
						<Separator />

						{/* Enhanced Route Display for Confirmation - Vertical Layout for Better Readability */}
						<div className="space-y-4">
							{/* Journey Route - Always Vertical */}
							<div className="bg-white rounded-lg border p-4 space-y-4">
								<h4 className="font-medium text-gray-900 text-sm mb-3">Journey Route</h4>
								<div className="space-y-3">
									{/* Origin */}
									<div className="flex items-start gap-3">
										<div className="relative mt-1">
											<div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
												<div className="w-2 h-2 rounded-full bg-white"></div>
											</div>
											{/* Connector line */}
											{(secureQuoteData?.stops && secureQuoteData.stops.length > 0) || quoteData.destination ? (
												<div className="absolute left-1/2 top-5 w-0.5 h-6 bg-gradient-to-b from-green-500 to-blue-400 transform -translate-x-1/2"></div>
											) : null}
										</div>
										<div className="flex-1 min-w-0 pt-0.5">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Pickup Location</span>
											</div>
											<div className="text-sm font-medium text-gray-900 break-words leading-relaxed">{quoteData.origin}</div>
										</div>
									</div>

									{/* Stops (if any) */}
									{secureQuoteData?.stops && secureQuoteData.stops.length > 0 && (
										<>
											{secureQuoteData.stops.map((stop: any, index: number) => (
												<div key={stop.id || index} className="flex items-start gap-3">
													<div className="relative mt-1">
														<div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
															<div className="w-2 h-2 rounded-full bg-white"></div>
														</div>
														{/* Connector line */}
														<div className="absolute left-1/2 top-5 w-0.5 h-6 bg-gradient-to-b from-blue-400 to-red-400 transform -translate-x-1/2"></div>
													</div>
													<div className="flex-1 min-w-0 pt-0.5">
														<div className="flex items-center gap-2 mb-1">
															<span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Stop {index + 1}</span>
														</div>
														<div className="text-sm font-medium text-gray-900 break-words leading-relaxed">{stop.address}</div>
													</div>
												</div>
											))}
										</>
									)}

									{/* Destination */}
									<div className="flex items-start gap-3">
										<div className="relative mt-1">
											<div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
												<div className="w-2 h-2 rounded-full bg-white"></div>
											</div>
										</div>
										<div className="flex-1 min-w-0 pt-0.5">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Drop-off Location</span>
											</div>
											<div className="text-sm font-medium text-gray-900 break-words leading-relaxed">{quoteData.destination}</div>
										</div>
									</div>
								</div>
							</div>

							{/* Journey Summary */}
							<div className="bg-gray-50 rounded-lg p-4">
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-gray-600">Distance:</span>
										<p className="font-medium text-gray-900">{quoteData.distance?.toFixed(1)} km</p>
									</div>
									<div>
										<span className="text-gray-600">Duration:</span>
										<p className="font-medium text-gray-900">{quoteData.duration} min</p>
									</div>
									{secureQuoteData?.stops && secureQuoteData.stops.length > 0 && (
										<div className="col-span-2">
											<span className="text-gray-600">Stops:</span>
											<p className="font-medium text-gray-900">{secureQuoteData.stops.length} intermediate stop{secureQuoteData.stops.length > 1 ? 's' : ''}</p>
										</div>
									)}
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-gray-600">Date & Time:</span>
								<p className="font-medium">
									{formData.scheduledPickupDate && formData.scheduledPickupTime ? (
										(() => {
											// Parse the date string directly without timezone conversion
											const [year, month, day] = formData.scheduledPickupDate.split('-');
											const [hours, minutes] = formData.scheduledPickupTime.split(':');
											
											// Format date parts manually to avoid timezone issues
											const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
											const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
											
											// Create a date object just for getting day of week (this should be safe)
											const tempDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
											const dayOfWeek = dayNames[tempDate.getDay()];
											
											// Format time to 12-hour format
											const hour24 = parseInt(hours);
											const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
											const ampm = hour24 >= 12 ? 'PM' : 'AM';
											
											return `${dayOfWeek}, ${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year} at ${hour12}:${minutes} ${ampm}`;
										})()
									) : (
										`${formData.scheduledPickupDate} at ${formData.scheduledPickupTime}`
									)}
								</p>
							</div>
							<div>
								<span className="text-gray-600">Passengers:</span>
								<p className="font-medium">{formData.passengerCount || 0} passenger{(formData.passengerCount || 0) !== 1 ? 's' : ''}</p>
							</div>
							<div>
								<span className="text-gray-600">Luggage:</span>
								<p className="font-medium">{formData.luggageCount || 0} piece{(formData.luggageCount || 0) !== 1 ? 's' : ''}</p>
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
							<CardContent className="p-4 sm:p-6 text-center">
								<h3 className="font-medium mb-2 text-base sm:text-lg">What happens next?</h3>
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
				</div>
			</div>
		);
	}

	return (
		<div ref={scrollContainerRef} className="min-h-screen bg-gray-50">
			<div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
				{/* Header */}
				<div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
					<Button variant="outline" size="icon" asChild>
						<Link to="/">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Complete Your Chauffeur Booking</h1>
						<p className="text-sm sm:text-base text-gray-600">Based on your instant quote</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
					{/* Quote Information Panel - Left Side */}
					<div className="lg:col-span-2 order-2 lg:order-1">
						<div className="lg:sticky lg:top-8">
							<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
								{/* Quote Header */}
								<div className="h-48 sm:h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center relative">
									<div className="text-center">
										<div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
											<Calculator className="w-10 h-10 text-primary/60" />
										</div>
										<h2 className="text-2xl font-bold text-gray-800 mb-2">Your Quote</h2>
										<p className="text-gray-600 text-sm px-4">
											Instant quote for your custom journey
										</p>
									</div>
								</div>

								<div className="p-8">
									{/* Price Display */}
									<div className="text-center mb-8">
										<div className="inline-flex items-baseline gap-2 bg-primary/10 px-6 py-4 rounded-xl border border-primary/20">
											<span className="text-4xl font-black text-primary">
												${quoteData.totalFare.toFixed(2)}
											</span>
											<span className="text-primary/80 text-sm font-medium">estimated fare</span>
										</div>
										<div className="mt-3">
											<span className="inline-block bg-primary/15 text-primary text-xs font-semibold px-3 py-1 rounded-full">
												*Price based on instant quote
											</span>
										</div>
									</div>

									{/* Trip Details */}
									<div className="space-y-4">
										<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
											<div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center">
												<MapPin className="w-3 h-3 text-primary" />
											</div>
											Trip Details
										</h3>

										<div className="space-y-3">
											{/* From */}
											<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
												<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
													<Navigation className="w-4 h-4 text-white" />
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Pickup Location</span>
													</div>
													<div className="text-sm font-medium text-gray-800 truncate">{quoteData.origin}</div>
												</div>
											</div>

											{/* Route connector line */}
											{(secureQuoteData?.stops && secureQuoteData.stops.length > 0) ? (
												<div className="flex justify-center">
													<div className="w-px h-4 bg-gradient-to-b from-green-400 to-blue-400"></div>
												</div>
											) : (
												<div className="flex justify-center">
													<div className="w-px h-4 bg-gradient-to-b from-green-400 to-red-400"></div>
												</div>
											)}

											{/* Stops (if any) */}
											{secureQuoteData?.stops && secureQuoteData.stops.length > 0 && (
												<>
													{secureQuoteData.stops.map((stop: any, index: number) => (
														<div key={stop.id || index}>
															<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
																<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
																	<CircleDot className="w-4 h-4 text-white" />
																</div>
																<div className="flex-1 min-w-0">
																	<div className="flex items-center gap-2 mb-1">
																		<span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Stop {index + 1}</span>
																	</div>
																	<div className="text-sm font-medium text-gray-800 truncate">{stop.address}</div>
																</div>
															</div>
															{/* Connector to next item */}
															{index < secureQuoteData.stops.length - 1 ? (
																<div className="flex justify-center">
																	<div className="w-px h-4 bg-gradient-to-b from-blue-400 to-blue-400"></div>
																</div>
															) : (
																<div className="flex justify-center">
																	<div className="w-px h-4 bg-gradient-to-b from-blue-400 to-red-400"></div>
																</div>
															)}
														</div>
													))}
												</>
											)}

											{/* To */}
											<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
												<div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
													<MapPinned className="w-4 h-4 text-white" />
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Drop-off Location</span>
													</div>
													<div className="text-sm font-medium text-gray-800 truncate">{quoteData.destination}</div>
												</div>
											</div>

											{/* Distance and Duration */}
											<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 mt-4">
												<div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
													<Clock className="w-4 h-4 text-white" />
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Journey Details</span>
													</div>
													<div className="text-sm font-medium text-gray-800">{quoteData.distance.toFixed(1)} km • {quoteData.duration} min</div>
												</div>
											</div>
										</div>
									</div>

									{/* Pre-selected Vehicle */}
									{quoteData.carId && (
										<div className="mt-6">
											<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
												<div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center">
													<Car className="w-3 h-3 text-primary" />
												</div>
												Pre-selected Vehicle
											</h3>
											<div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
												<div className="flex items-center gap-3">
													<div className="w-16 h-12 bg-primary/10 rounded border flex items-center justify-center">
														<Car className="w-6 h-6 text-primary/60" />
													</div>
													<div className="flex-1 min-w-0">
														<div className="font-medium text-sm text-gray-900">
															Vehicle from your quote
														</div>
														<div className="text-xs text-muted-foreground mt-1">
															Confirmed for booking
														</div>
													</div>
												</div>
											</div>
										</div>
									)}

									{/* Fare Breakdown */}
									{secureQuoteData && (secureQuoteData.firstKmFare || secureQuoteData.additionalKmFare) && (
										<div className="mt-6">
											<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
												<div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center">
													<Calculator className="w-3 h-3 text-primary" />
												</div>
												Fare Breakdown
											</h3>
											<div className="space-y-2">
												{secureQuoteData.firstKmFare && (
													<div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
														<span className="text-sm text-gray-600">First {secureQuoteData.breakdown?.firstKmDistance || 10}km</span>
														<span className="text-sm font-medium">${secureQuoteData.firstKmFare.toFixed(2)}</span>
													</div>
												)}
												{secureQuoteData.additionalKmFare && secureQuoteData.additionalKmFare > 0 && (
													<div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
														<span className="text-sm text-gray-600">Additional {secureQuoteData.breakdown?.additionalDistance?.toFixed(1) || 0}km</span>
														<span className="text-sm font-medium">${secureQuoteData.additionalKmFare.toFixed(2)}</span>
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Booking Form Panel - Right Side */}
					<div className="lg:col-span-3 order-1 lg:order-2">
						<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
							<div className="bg-primary p-4 sm:p-6 lg:p-8">
								<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Book Your Chauffeur</h1>
								<p className="text-sm sm:text-base text-primary-foreground/90">Complete your chauffeur booking in just a few steps</p>
							</div>

							<div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
								{/* Contact Information Section */}
								<div className="space-y-4 sm:space-y-6">
									<div className="flex items-center gap-3 sm:gap-4">
										<div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
											<span className="text-white text-sm sm:text-lg font-bold">1</span>
										</div>
										<div>
											<h3 className="text-lg sm:text-xl font-bold text-gray-900">Contact Information</h3>
											<p className="text-gray-500 text-xs sm:text-sm">We'll use this to reach you about your booking</p>
										</div>
									</div>

									<div className="space-y-4 sm:space-y-5 pl-0 sm:pl-14">
										<div>
											<label className="block text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Full Name *</label>
											<Input
												placeholder="Enter your full name"
												value={formData.customerName || ""}
												onChange={(e) => updateFormData("customerName", e.target.value)}
												className={`w-full h-10 sm:h-12 text-sm sm:text-base ${formErrors.customerName ? "border-red-500" : ""}`}
											/>
											{formErrors.customerName && (
												<p className="text-red-500 text-sm mt-1">{formErrors.customerName}</p>
											)}
										</div>

										<div>
											<label className="block text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Email Address *</label>
											<Input
												type="email"
												placeholder="Enter your email"
												value={formData.customerEmail || ""}
												onChange={(e) => updateFormData("customerEmail", e.target.value)}
												className={`w-full h-10 sm:h-12 text-sm sm:text-base ${formErrors.customerEmail ? "border-red-500" : ""}`}
											/>
											{formErrors.customerEmail && (
												<p className="text-red-500 text-sm mt-1">{formErrors.customerEmail}</p>
											)}
										</div>

										<div>
											<label className="block text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Phone Number *</label>
											<Input
												type="tel"
												placeholder="Enter your phone number"
												value={formData.customerPhone || ""}
												onChange={(e) => updateFormData("customerPhone", e.target.value)}
												className={`w-full h-10 sm:h-12 text-sm sm:text-base ${formErrors.customerPhone ? "border-red-500" : ""}`}
											/>
											{formErrors.customerPhone && (
												<p className="text-red-500 text-sm mt-1">{formErrors.customerPhone}</p>
											)}
										</div>
									</div>
								</div>

								{/* Booking Details Section */}
								<div className="space-y-4 sm:space-y-6">
									<div className="flex items-center gap-3 sm:gap-4">
										<div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
											<span className="text-white text-sm sm:text-lg font-bold">2</span>
										</div>
										<div>
											<h3 className="text-lg sm:text-xl font-bold text-gray-900">Booking Details</h3>
											<p className="text-gray-500 text-xs sm:text-sm">Tell us about your chauffeur service needs</p>
										</div>
									</div>

									<div className="space-y-4 sm:space-y-5 pl-0 sm:pl-14">
										{/* Passengers and Luggage side by side */}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
											<div>
												<label className="block text-sm font-semibold text-gray-800 mb-1">Number of Passengers *</label>
												<p className="text-xs text-gray-600 mb-2 sm:mb-3">Maximum capacity: {carData?.seatingCapacity || 8} passengers</p>
												<Input
													type="number"
													min="1"
													max={carData?.seatingCapacity || 8}
													placeholder="e.g. 2"
													value={formData.passengerCount || ""}
													onChange={(e) => updateFormData("passengerCount", e.target.value ? parseInt(e.target.value) : undefined)}
													className={`w-full h-10 sm:h-12 text-sm sm:text-base ${formErrors.passengerCount ? "border-red-500" : ""}`}
												/>
												{formErrors.passengerCount && (
													<p className="text-red-500 text-sm mt-1">{formErrors.passengerCount}</p>
												)}
											</div>

											<div>
												<label className="block text-sm font-semibold text-gray-800 mb-1">Luggage Pieces *</label>
												<p className="text-xs text-gray-600 mb-2 sm:mb-3">Maximum capacity: {carData?.luggageCapacity || 10} pieces of luggage</p>
												<Input
													type="number"
													min="0"
													max={carData?.luggageCapacity || 10}
													placeholder="e.g. 3"
													value={formData.luggageCount || ""}
													onChange={(e) => updateFormData("luggageCount", e.target.value ? parseInt(e.target.value) : undefined)}
													className={`w-full h-10 sm:h-12 text-sm sm:text-base ${formErrors.luggageCount ? "border-red-500" : ""}`}
												/>
												{formErrors.luggageCount && (
													<p className="text-red-500 text-sm mt-1">{formErrors.luggageCount}</p>
												)}
											</div>
										</div>

										<DateTimePicker
											selectedDate={date}
											selectedTime={formData.scheduledPickupTime || ""}
											onDateChange={(selectedDate) => {
												setDate(selectedDate);
												if (selectedDate) {
													// Use local date formatting to avoid timezone conversion
													const year = selectedDate.getFullYear();
													const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
													const day = String(selectedDate.getDate()).padStart(2, '0');
													const localDateString = `${year}-${month}-${day}`;
													updateFormData("scheduledPickupDate", localDateString);
												}
											}}
											onTimeChange={(time) => updateFormData("scheduledPickupTime", time)}
											dateError={formErrors.scheduledPickupDate}
											timeError={formErrors.scheduledPickupTime}
											dateLabel="Pickup Date *"
											timeLabel="Pickup Time *"
										/>

										<div>
											<label className="block text-sm font-semibold text-gray-800 mb-3">
												Special Requirements <span className="text-gray-400 font-normal">(Optional)</span>
											</label>
											<Textarea
												placeholder="Any special requests, accessibility needs, or requirements..."
												value={formData.specialRequests || ""}
												onChange={(e) => updateFormData("specialRequests", e.target.value)}
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
												<span className="font-semibold text-gray-800">Chauffeur Service Price</span>
												<p className="text-sm text-gray-600">Based on your instant quote</p>
											</div>
											<span className="text-2xl font-bold text-primary">
												${quoteData.totalFare.toFixed(2)}
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
														<li>• Pay after service completion</li>
														<li>• Driver accepts cash or cashless payments</li>
														<li>• Online payment options available soon</li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Action Button */}
								<div className="pt-3 sm:pt-4">
									<Button
										onClick={handleSubmit}
										className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold"
										disabled={createBookingMutation.isPending}
									>
										{createBookingMutation.isPending ? (
											<>
												<Loader2 className="mr-3 h-6 w-6 animate-spin" />
												Creating Your Booking...
											</>
										) : sessionData?.user ? (
											"Book Now"
										) : (
											"Sign In & Book"
										)}
									</Button>

									{/* Help Messages */}
									{createBookingMutation.isPending && (
										<div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
											<div>📤 Processing your booking...</div>
										</div>
									)}

									<p className="text-sm text-gray-500 text-center mt-6 leading-relaxed">
										By proceeding, you agree to our{" "}
										<span className="text-primary underline cursor-pointer hover:text-primary/80">terms of service</span>{" "}
										and{" "}
										<span className="text-primary underline cursor-pointer hover:text-primary/80">privacy policy</span>.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
