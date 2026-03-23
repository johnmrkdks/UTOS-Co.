import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import {
	AlertCircle,
	ArrowLeft,
	Calculator,
	Calendar,
	Car,
	CheckCircle,
	CircleDot,
	Clock,
	Loader2,
	LogIn,
	Mail,
	MapPin,
	MapPinned,
	Navigation,
	Package,
	Phone,
	User,
	Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { DateTimePicker } from "@/components/date-time-picker";
import { useCustomerProfileQuery } from "@/features/auth/_hooks/query/use-customer-profile-query";
import { useGetCarQuery } from "@/features/customer/_hooks/query/use-get-car-query";
import {
	useCreateCustomBookingFromQuoteAsGuestMutation,
	useCreateCustomBookingFromQuoteMutation,
} from "@/features/marketing/_hooks/query/use-create-custom-booking-from-quote-mutation";
import { SquarePaymentForm } from "@/features/payments/_components/square-payment-form";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/trpc";
import { createLocalDateForBackend } from "@/utils/timezone";
import { useGetSecureQuoteQuery } from "./_hooks/use-get-secure-quote-query";

// Create dynamic booking form schema based on car capacity
const createQuoteBookingFormSchema = (
	maxPassengers?: number,
	maxLuggage?: number,
) =>
	z.object({
		scheduledPickupDate: z.string().min(1, "Please select a pickup date"),
		scheduledPickupTime: z.string().min(1, "Please select a pickup time"),
		customerName: z.string().min(1, "Please enter your full name"),
		customerPhone: z.string().min(1, "Please enter your phone number"),
		customerEmail: z.string().email("Please enter a valid email address"),
		passengerCount: z
			.number()
			.min(1, "At least 1 passenger required")
			.max(
				maxPassengers || 8,
				`Maximum ${maxPassengers || 8} passengers allowed for this vehicle`,
			),
		luggageCount: z
			.number()
			.min(0, "Luggage count cannot be negative")
			.max(
				maxLuggage || 10,
				`Maximum ${maxLuggage || 10} pieces of luggage allowed for this vehicle`,
			),
		specialRequests: z.string().optional(),
	});

type QuoteBookingFormData = z.infer<
	ReturnType<typeof createQuoteBookingFormSchema>
>;

interface QuoteBookingPageProps {
	isCustomerArea?: boolean;
	pathQuoteId?: string; // For customer routes that use path parameters
	isGuestFlow?: boolean; // Guest booking (no account required)
}

export function QuoteBookingPage({
	isCustomerArea = false,
	pathQuoteId,
	isGuestFlow = false,
}: QuoteBookingPageProps) {
	const search = useSearch({ strict: false }) as any;
	const navigate = useNavigate();

	// Scroll to top functionality
	const scrollContainerRef = useScrollToTop({
		behavior: "smooth",
		disabled: true,
	});

	// Use user query for authenticated users only
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	const { data: profileData, isLoading: profileLoading } =
		useCustomerProfileQuery();

	// Get quote ID from either path parameter (customer routes) or search parameter (public routes)
	const quoteId = pathQuoteId || search?.quoteId || "";

	// Fetch secure quote if quoteId is provided
	const {
		data: secureQuoteData,
		isLoading: secureQuoteLoading,
		error: secureQuoteError,
	} = useGetSecureQuoteQuery(quoteId, { enabled: !!quoteId });

	// Enhanced debugging for quote data
	console.log("🔍 Quote debugging:");
	console.log("- quoteId:", quoteId);
	console.log("- secureQuoteLoading:", secureQuoteLoading);
	console.log("- secureQuoteError:", secureQuoteError);
	console.log("- secureQuoteData:", secureQuoteData);

	// Mutation for creating booking from quote (authenticated or guest)
	const createBookingMutation = useCreateCustomBookingFromQuoteMutation();
	const createGuestBookingMutation =
		useCreateCustomBookingFromQuoteAsGuestMutation();

	// Get car details if carId is available in quote data
	const carId = secureQuoteData?.carId || search?.carId || "";
	console.log("🚗 Car debugging:");
	console.log("- carId from quote:", secureQuoteData?.carId);
	console.log("- carId from search:", search?.carId);
	console.log("- final carId:", carId);
	console.log("- carId enabled?", !!carId);

	const {
		data: carData,
		isLoading: carLoading,
		error: carError,
	} = useGetCarQuery({ id: carId }, { enabled: !!carId });

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
			isAvailable: carData.isAvailable,
		});
	}
	if (carError) {
		console.error("❌ Car loading error details:", {
			message: carError.message,
			data: carError.data,
			shape: carError.shape,
		});
	}

	// Form state - pre-populate for authenticated users
	const [formData, setFormData] = useState<Partial<QuoteBookingFormData>>({});
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [step, setStep] = useState<"details" | "payment" | "confirmation">(
		"details",
	);
	const [date, setDate] = useState<Date>();
	const [bookingResult, setBookingResult] = useState<any>(null);

	// Square config for payment step (only fetch when on payment step)
	const {
		data: squareConfig,
		isLoading: squareConfigLoading,
		error: squareConfigError,
	} = useQuery({
		...trpc.payments.getSquareConfig.queryOptions(),
		enabled: step === "payment" && !!bookingResult?.id,
	});

	// Pre-populate form data for authenticated users
	useEffect(() => {
		if (sessionData?.user && profileData?.user) {
			setFormData((prev) => ({
				...prev,
				customerName: prev.customerName || profileData.user.name || "",
				customerEmail: prev.customerEmail || profileData.user.email || "",
				customerPhone: prev.customerPhone || profileData.user.phone || "",
			}));
		}
	}, [sessionData, profileData]);

	// Extract quote data - prioritize secure quote, fallback to URL params
	// Note: instant quote API returns estimatedDistance in km (from calculateInstantQuoteService)
	const quoteData = secureQuoteData
		? {
				origin: secureQuoteData.originAddress,
				destination: secureQuoteData.destinationAddress,
				distance: secureQuoteData.estimatedDistance ?? 0, // Already in km from API
				duration: Math.round((secureQuoteData.estimatedDuration || 0) / 60), // Convert seconds to minutes
				totalFare: secureQuoteData.totalAmount || 0,
				carId: secureQuoteData.carId, // Pre-selected car from quote
			}
		: {
				origin: search?.origin || "",
				destination: search?.destination || "",
				distance: Number.parseFloat(search?.distance || "0"),
				duration: Number.parseInt(search?.duration || "0"),
				totalFare: Number.parseFloat(search?.totalFare || "0"),
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
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (formErrors[field]) {
			setFormErrors((prev) => ({ ...prev, [field]: "" }));
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
				carDataAvailable: !!carData,
			});

			const QuoteBookingFormSchema = createQuoteBookingFormSchema(
				carData?.seatingCapacity || undefined,
				carData?.luggageCapacity || undefined,
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

		// Only authenticated users can book - unless in guest flow
		if (!isGuestFlow && !sessionData?.user) {
			toast.error("Please sign in to complete your booking.");
			navigate({ to: "/sign-in", resetScroll: true });
			return;
		}

		const effectiveUserInfo = isGuestFlow
			? {
					id: "",
					name: formData.customerName || "",
					email: formData.customerEmail || "",
					isGuest: true as const,
				}
			: {
					id: sessionData!.user.id,
					name: sessionData!.user.name || formData.customerName || "User",
					email: sessionData!.user.email || formData.customerEmail || "",
					isGuest: false as const,
				};

		console.log("👤 User info for booking:", effectiveUserInfo);

		if (!quoteData.origin || !quoteData.destination) {
			toast.error("Quote information is missing. Please start a new quote.");
			return;
		}

		try {
			// Use simplified pricing from secure quote data if available
			const firstKmFareAmount =
				secureQuoteData?.firstKmFare || quoteData.totalFare * 0.7;
			const additionalKmFareAmount =
				secureQuoteData?.additionalKmFare || quoteData.totalFare * 0.3;
			const quotedAmount = quoteData.totalFare; // Store as dollar amount

			const bookingPayload = {
				...(isGuestFlow
					? { isGuest: true as const }
					: { userId: effectiveUserInfo.id }),
				originAddress: quoteData.origin,
				destinationAddress: quoteData.destination,
				// Include stops from the secure quote data
				stops: secureQuoteData?.stops
					? secureQuoteData.stops.map((stop: any, index: number) => ({
							address: stop.address,
							latitude: stop.latitude,
							longitude: stop.longitude,
							stopOrder: index + 1, // Add required stopOrder field
							waitingTime: 0, // Default waiting time
							notes: stop.notes || undefined, // Optional notes
						}))
					: [],
				scheduledPickupTime: createLocalDateForBackend(
					formData.scheduledPickupDate!,
					formData.scheduledPickupTime!,
				),
				estimatedDuration: quoteData.duration * 60, // Convert minutes to seconds
				estimatedDistance: quoteData.distance, // Backend expects km
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
				preferredCarId: preselectedCarId, // Fixed: Use preferredCarId instead of preferredCategoryId
			};

			console.log("📦 Quote booking payload:", bookingPayload);

			// Use the appropriate mutation (guest vs authenticated)
			const result = isGuestFlow
				? await createGuestBookingMutation.mutateAsync(bookingPayload)
				: await createBookingMutation.mutateAsync(bookingPayload);

			console.log("✅ Quote booking created (pending payment):", result);
			setBookingResult(result);
			setStep("payment");

			// Scroll to top after confirmation
			setTimeout(() => {
				if (scrollContainerRef.current) {
					scrollContainerRef.current.scrollTo({
						top: 0,
						behavior: "smooth",
					});
				} else {
					// Fallback to window scroll if container ref not found
					window.scrollTo({
						top: 0,
						behavior: "smooth",
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
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-gray-600">
					{sessionLoading
						? "Setting up session..."
						: "Loading quote details..."}
				</span>
			</div>
		);
	}

	// Check authentication requirement for users with valid quote data
	// Skip auth check when in guest flow (Continue as Guest)
	if (
		!isGuestFlow &&
		!sessionLoading &&
		!sessionData?.user &&
		(secureQuoteData ||
			(quoteData.origin && quoteData.destination && quoteData.totalFare))
	) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8">
					<div className="mx-auto max-w-2xl space-y-4 text-center sm:space-y-6">
						{/* Authentication Required Card */}
						<Card className="border-blue-200 bg-blue-50">
							<CardContent className="p-4 sm:p-8">
								<div className="space-y-3 sm:space-y-4">
									<div>
										<h2 className="mb-2 font-bold text-gray-900 text-xl sm:text-2xl">
											Complete Your Chauffeur Booking
										</h2>
										<p className="text-gray-600 text-sm sm:text-base">
											Please sign in to your account to complete your booking.
											This helps us provide better service and manage your
											reservations.
										</p>
									</div>

									{/* Selected Car */}
									{carId && (
										<div className="rounded-lg border bg-white p-3 text-left sm:p-4">
											<h3 className="mb-2 text-center font-medium text-gray-900 text-sm sm:mb-3 sm:text-base">
												Pre-selected Vehicle
											</h3>
											<div className="flex items-center gap-2 sm:gap-3">
												<div className="flex h-10 w-12 flex-shrink-0 items-center justify-center rounded border bg-primary/10 sm:h-12 sm:w-16">
													<Car className="h-4 w-4 text-primary/60 sm:h-6 sm:w-6" />
												</div>
												<div className="min-w-0 flex-1">
													{carLoading ? (
														<>
															<div className="font-medium text-gray-900 text-sm">
																Loading vehicle details...
															</div>
															<div className="mt-1 text-muted-foreground text-xs">
																Please wait
															</div>
														</>
													) : carError ? (
														<>
															<div className="font-medium text-orange-900 text-sm">
																Vehicle details unavailable
															</div>
															<div className="mt-1 text-orange-600 text-xs">
																Using standard capacity limits (8 passengers, 10
																luggage)
															</div>
														</>
													) : carData ? (
														<>
															<div className="truncate font-medium text-gray-900 text-xs sm:text-sm">
																{carData.name}
															</div>
															<div className="mt-0.5 truncate text-muted-foreground text-xs sm:mt-1">
																{carData.category?.name || "Premium Vehicle"}
															</div>
															{carData.features &&
																carData.features.length > 0 && (
																	<div className="mt-1 flex flex-wrap gap-1 sm:mt-2">
																		{carData.features
																			.slice(0, 2)
																			.map((feature: any) => (
																				<Badge
																					key={feature.id}
																					variant="secondary"
																					className="px-1.5 py-0.5 text-xs"
																				>
																					{feature.name}
																				</Badge>
																			))}
																		{carData.features.length > 2 && (
																			<Badge
																				variant="secondary"
																				className="px-1.5 py-0.5 text-xs"
																			>
																				+{carData.features.length - 2} more
																			</Badge>
																		)}
																	</div>
																)}
														</>
													) : null}
												</div>
											</div>
										</div>
									)}

									{/* Quote Summary with Fare Breakdown */}
									{(secureQuoteData || quoteData.origin) && (
										<div className="w-full rounded-lg border bg-white p-3 text-left sm:p-4">
											<h3 className="mb-2 text-center font-medium text-gray-900 text-sm sm:mb-3 sm:text-base">
												Your Quote Summary
											</h3>
											<div className="space-y-2 text-xs sm:space-y-3 sm:text-sm">
												{/* From */}
												<div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-2 sm:p-3">
													<div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500 sm:h-6 sm:w-6">
														<Navigation className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
													</div>
													<div className="min-w-0 flex-1">
														<span className="block font-medium text-green-700 text-xs">
															Pickup
														</span>
														<div className="mt-0.5 break-words font-medium text-gray-800 text-xs leading-tight sm:text-sm">
															{secureQuoteData?.originAddress ||
																quoteData.origin}
														</div>
													</div>
												</div>

												{/* Stops (if any) */}
												{secureQuoteData?.stops &&
													secureQuoteData.stops.length > 0 && (
														<>
															{secureQuoteData.stops.map(
																(stop: any, index: number) => (
																	<div
																		key={stop.id || index}
																		className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2 sm:p-3"
																	>
																		<div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 sm:h-6 sm:w-6">
																			<CircleDot className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
																		</div>
																		<div className="min-w-0 flex-1">
																			<span className="block font-medium text-blue-700 text-xs">
																				Stop {index + 1}
																			</span>
																			<div className="mt-0.5 break-words font-medium text-gray-800 text-xs leading-tight sm:text-sm">
																				{stop.address}
																			</div>
																		</div>
																	</div>
																),
															)}
														</>
													)}

												{/* To */}
												<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2 sm:p-3">
													<div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500 sm:h-6 sm:w-6">
														<MapPinned className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
													</div>
													<div className="min-w-0 flex-1">
														<span className="block font-medium text-red-700 text-xs">
															Drop-off
														</span>
														<div className="mt-0.5 break-words font-medium text-gray-800 text-xs leading-tight sm:text-sm">
															{secureQuoteData?.destinationAddress ||
																quoteData.destination}
														</div>
													</div>
												</div>

												{/* Journey Details */}
												<div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-2 sm:gap-3 sm:p-3">
													<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 sm:h-6 sm:w-6">
														<Clock className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
													</div>
													<div className="flex-1">
														<span className="block font-medium text-purple-700 text-xs">
															Journey
														</span>
														<div className="mt-0.5 font-medium text-gray-800 text-xs sm:text-sm">
															{quoteData.distance.toFixed(1)} km •{" "}
															{quoteData.duration} min
														</div>
													</div>
												</div>
											</div>

											<div>
												{/* Fare Breakdown */}
												{(secureQuoteData?.firstKmFare ||
													secureQuoteData?.additionalKmFare) && (
													<div className="mt-2 border-t pt-2">
														<div className="mb-2 font-medium text-gray-700 text-xs">
															Fare Breakdown:
														</div>
														<div className="space-y-1">
															{secureQuoteData?.firstKmFare && (
																<div className="flex justify-between text-xs">
																	<span className="text-gray-500">
																		First{" "}
																		{Math.ceil(
																			secureQuoteData.breakdown
																				?.firstKmDistance || 10,
																		)}
																		km (Flat Rate):
																	</span>
																	<span>
																		${secureQuoteData.firstKmFare.toFixed(2)}
																	</span>
																</div>
															)}
															{secureQuoteData?.additionalKmFare &&
																secureQuoteData.additionalKmFare > 0 && (
																	<div className="flex justify-between text-xs">
																		<span className="text-gray-500">
																			Additional{" "}
																			{secureQuoteData.breakdown?.additionalDistance?.toFixed(
																				1,
																			) || 0}
																			km:
																		</span>
																		<span>
																			$
																			{secureQuoteData.additionalKmFare.toFixed(
																				2,
																			)}
																		</span>
																	</div>
																)}
															{secureQuoteData?.extraCharges &&
																secureQuoteData.extraCharges > 0 && (
																	<div className="flex justify-between text-xs">
																		<span className="text-gray-500">
																			Additional charges:
																		</span>
																		<span>
																			${secureQuoteData.extraCharges.toFixed(2)}
																		</span>
																	</div>
																)}
														</div>
													</div>
												)}

												<div className="flex justify-between border-t pt-2 text-base">
													<span className="font-medium text-gray-900">
														Total Fare:
													</span>
													<span className="font-bold text-primary">
														${quoteData.totalFare.toFixed(2)}
													</span>
												</div>
											</div>
										</div>
									)}

									<div className="space-y-3">
										<Button
											className="h-12 w-full font-semibold text-base"
											onClick={() => {
												// Preserve the current URL for redirect after sign-in
												const currentPath =
													window.location.pathname + window.location.search;
												navigate({
													to: "/sign-in",
													search: { redirect: currentPath },
													resetScroll: true,
												});
											}}
										>
											<LogIn className="mr-2 h-5 w-5" />
											Sign In to Continue
										</Button>

										<Button
											asChild
											variant="outline"
											className="h-12 w-full font-semibold text-base"
										>
											<Link
												to="/book-quote/$quoteId"
												params={{ quoteId }}
												search={{ guest: "1" }}
												resetScroll
											>
												<User className="mr-2 h-5 w-5" />
												Continue as Guest
											</Link>
										</Button>

										<Button
											variant="outline"
											className="w-full"
											onClick={() => {
												const currentPath =
													window.location.pathname + window.location.search;
												navigate({
													to: "/sign-up",
													search: { redirect: currentPath },
													resetScroll: true,
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
								<h3 className="mb-3 font-medium text-gray-900">
									Why create an account?
								</h3>
								<ul className="space-y-1 text-left text-gray-600 text-sm">
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
			<div className="py-12 text-center">
				<AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
				<h3 className="mb-2 font-medium text-gray-900 text-lg">
					Quote Expired or Invalid
				</h3>
				<p className="mb-4 text-gray-600">
					Your quote has expired or could not be found. Please generate a new
					quote to continue.
				</p>
				<Button asChild>
					<Link to="/">Get New Quote</Link>
				</Button>
			</div>
		);
	}

	// Check if we have valid quote data
	if (!quoteData.origin || !quoteData.destination || !quoteData.totalFare) {
		return (
			<div className="py-12 text-center">
				<Calculator className="mx-auto mb-4 h-12 w-12 text-gray-400" />
				<h3 className="mb-2 font-medium text-gray-900 text-lg">
					No quote information found
				</h3>
				<p className="mb-4 text-gray-600">
					Please start a new instant quote to proceed with booking
				</p>
				<Button asChild>
					<Link to="/">Get New Quote</Link>
				</Button>
			</div>
		);
	}

	// Payment step: show SquarePaymentForm after booking created
	if (step === "payment" && bookingResult?.id) {
		if (squareConfigError) {
			return (
				<div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
					<Card className="w-full max-w-md">
						<CardContent className="pt-6">
							<AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
							<h3 className="mb-2 text-center font-medium text-lg">
								Payment Setup Error
							</h3>
							<p className="mb-4 text-center text-muted-foreground text-sm">
								{squareConfigError.message}
							</p>
							<Button
								variant="outline"
								className="w-full"
								onClick={() => setStep("details")}
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Booking
							</Button>
						</CardContent>
					</Card>
				</div>
			);
		}

		if (squareConfigLoading || !squareConfig) {
			return (
				<div className="flex min-h-screen items-center justify-center bg-gray-50">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<span className="ml-2">Loading payment form...</span>
				</div>
			);
		}

		const amountCents = Math.round((quoteData.totalFare || 0) * 100);

		return (
			<div className="min-h-screen bg-gray-50">
				<div className="mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-8">
					<div className="mb-6 flex items-center gap-3">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setStep("details")}
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<div>
							<h1 className="font-bold text-gray-900 text-xl">
								Complete Payment
							</h1>
							<p className="text-muted-foreground text-sm">
								Authorize your payment to confirm the booking
							</p>
						</div>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Payment Details</CardTitle>
							<CardDescription>
								Your card will be authorized for $
								{quoteData.totalFare?.toFixed(2) ?? "0.00"}. You will be charged
								after your trip is completed.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<SquarePaymentForm
								applicationId={squareConfig.applicationId}
								locationId={squareConfig.locationId}
								amountCents={amountCents}
								bookingId={bookingResult.id}
								onAuthorized={() => {
									setStep("confirmation");
									toast.success("Payment authorized", {
										description: "Your booking is now confirmed.",
									});
									setTimeout(() => {
										if (scrollContainerRef.current) {
											scrollContainerRef.current.scrollTo({
												top: 0,
												behavior: "smooth",
											});
										} else {
											window.scrollTo({ top: 0, behavior: "smooth" });
										}
									}, 100);
								}}
								onError={(msg) =>
									toast.error("Payment failed", { description: msg })
								}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (step === "confirmation") {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8">
					<div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
						{/* Header */}
						<div className="space-y-3 text-center sm:space-y-4">
							<CheckCircle className="mx-auto h-12 w-12 text-green-500 sm:h-16 sm:w-16" />
							<div>
								<h1 className="font-bold text-2xl text-gray-900 sm:text-3xl">
									Booking Confirmed!
								</h1>
								<p className="text-gray-600 text-sm sm:text-base">
									Your custom booking has been submitted successfully
								</p>
								{bookingResult?.referenceNumber && (
									<div className="mt-3 inline-block rounded-full border-2 border-primary bg-primary/10 px-4 py-2">
										<p className="font-semibold text-primary text-sm">
											Reference: #{bookingResult.referenceNumber}
										</p>
									</div>
								)}
								{!sessionData?.user && (
									<p className="mt-2 text-blue-600 text-sm">
										💡 Tip: Create an account to easily manage your bookings
									</p>
								)}
							</div>
						</div>

						{/* Booking Details */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg sm:text-xl">
									Booking Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 sm:space-y-4">
								<div>
									<h4 className="font-medium">Chauffeur Journey</h4>
									<p className="text-gray-600 text-sm">
										Based on your instant quote
									</p>
								</div>
								<Separator />

								{/* Enhanced Route Display for Confirmation - Vertical Layout for Better Readability */}
								<div className="space-y-4">
									{/* Journey Route - Always Vertical */}
									<div className="space-y-4 rounded-lg border bg-white p-4">
										<h4 className="mb-3 font-medium text-gray-900 text-sm">
											Journey Route
										</h4>
										<div className="space-y-3">
											{/* Origin */}
											<div className="flex items-start gap-3">
												<div className="relative mt-1">
													<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-md">
														<div className="h-2 w-2 rounded-full bg-white" />
													</div>
													{/* Connector line */}
													{(secureQuoteData?.stops &&
														secureQuoteData.stops.length > 0) ||
													quoteData.destination ? (
														<div className="-translate-x-1/2 absolute top-5 left-1/2 h-6 w-0.5 transform bg-gradient-to-b from-green-500 to-blue-400" />
													) : null}
												</div>
												<div className="min-w-0 flex-1 pt-0.5">
													<div className="mb-1 flex items-center gap-2">
														<span className="font-semibold text-green-700 text-xs uppercase tracking-wide">
															Pickup Location
														</span>
													</div>
													<div className="break-words font-medium text-gray-900 text-sm leading-relaxed">
														{quoteData.origin}
													</div>
												</div>
											</div>

											{/* Stops (if any) */}
											{secureQuoteData?.stops &&
												secureQuoteData.stops.length > 0 && (
													<>
														{secureQuoteData.stops.map(
															(stop: any, index: number) => (
																<div
																	key={stop.id || index}
																	className="flex items-start gap-3"
																>
																	<div className="relative mt-1">
																		<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-md">
																			<div className="h-2 w-2 rounded-full bg-white" />
																		</div>
																		{/* Connector line */}
																		<div className="-translate-x-1/2 absolute top-5 left-1/2 h-6 w-0.5 transform bg-gradient-to-b from-blue-400 to-red-400" />
																	</div>
																	<div className="min-w-0 flex-1 pt-0.5">
																		<div className="mb-1 flex items-center gap-2">
																			<span className="font-semibold text-blue-700 text-xs uppercase tracking-wide">
																				Stop {index + 1}
																			</span>
																		</div>
																		<div className="break-words font-medium text-gray-900 text-sm leading-relaxed">
																			{stop.address}
																		</div>
																	</div>
																</div>
															),
														)}
													</>
												)}

											{/* Destination */}
											<div className="flex items-start gap-3">
												<div className="relative mt-1">
													<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-md">
														<div className="h-2 w-2 rounded-full bg-white" />
													</div>
												</div>
												<div className="min-w-0 flex-1 pt-0.5">
													<div className="mb-1 flex items-center gap-2">
														<span className="font-semibold text-red-700 text-xs uppercase tracking-wide">
															Drop-off Location
														</span>
													</div>
													<div className="break-words font-medium text-gray-900 text-sm leading-relaxed">
														{quoteData.destination}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Selected Vehicle */}
								{carId && (
									<div className="rounded-lg border bg-white p-4">
										<h4 className="mb-3 font-medium text-gray-900 text-sm">
											Selected Vehicle
										</h4>
										<div className="flex items-center gap-3">
											{carData?.images && carData.images.length > 0 ? (
												<div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded border bg-gray-200">
													<img
														src={
															carData.images.find((img: any) => img.isMain)
																?.url || carData.images[0].url
														}
														alt={carData.name}
														className="h-full w-full object-cover"
													/>
												</div>
											) : (
												<div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded border bg-primary/10">
													<Car className="h-8 w-8 text-primary/60" />
												</div>
											)}
											<div className="min-w-0 flex-1">
												{carLoading ? (
													<>
														<div className="font-medium text-gray-900 text-sm">
															Loading vehicle details...
														</div>
														<div className="mt-1 text-muted-foreground text-xs">
															Please wait
														</div>
													</>
												) : carData ? (
													<>
														<div className="font-medium text-base text-gray-900">
															{carData.name}
														</div>
														<div className="mt-0.5 text-muted-foreground text-sm">
															{carData.category?.name || "Premium Vehicle"} •{" "}
															{carData.seatingCapacity} seats
														</div>
														{carData.features &&
															carData.features.length > 0 && (
																<div className="mt-2 flex flex-wrap gap-1">
																	{carData.features
																		.slice(0, 3)
																		.map((feature: any) => (
																			<Badge
																				key={feature.id}
																				variant="secondary"
																				className="px-2 py-0.5 text-xs"
																			>
																				{feature.name}
																			</Badge>
																		))}
																	{carData.features.length > 3 && (
																		<Badge
																			variant="secondary"
																			className="px-2 py-0.5 text-xs"
																		>
																			+{carData.features.length - 3} more
																		</Badge>
																	)}
																</div>
															)}
													</>
												) : (
													<>
														<div className="font-medium text-base text-gray-900">
															Premium Vehicle
														</div>
														<div className="mt-0.5 text-muted-foreground text-sm">
															Selected from your quote
														</div>
													</>
												)}
											</div>
										</div>
									</div>
								)}

								<div className="space-y-3 text-sm">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<span className="text-gray-600">Date & Time:</span>
											<p className="font-medium">
												{formData.scheduledPickupDate &&
												formData.scheduledPickupTime
													? (() => {
															// Parse the date string directly without timezone conversion
															const [year, month, day] =
																formData.scheduledPickupDate.split("-");
															const [hours, minutes] =
																formData.scheduledPickupTime.split(":");

															// Format date parts manually to avoid timezone issues
															const monthNames = [
																"Jan",
																"Feb",
																"Mar",
																"Apr",
																"May",
																"Jun",
																"Jul",
																"Aug",
																"Sep",
																"Oct",
																"Nov",
																"Dec",
															];
															const dayNames = [
																"Sun",
																"Mon",
																"Tue",
																"Wed",
																"Thu",
																"Fri",
																"Sat",
															];

															// Create a date object just for getting day of week (this should be safe)
															const tempDate = new Date(
																Number.parseInt(year),
																Number.parseInt(month) - 1,
																Number.parseInt(day),
															);
															const dayOfWeek = dayNames[tempDate.getDay()];

															// Format time to 12-hour format
															const hour24 = Number.parseInt(hours);
															const hour12 =
																hour24 === 0
																	? 12
																	: hour24 > 12
																		? hour24 - 12
																		: hour24;
															const ampm = hour24 >= 12 ? "PM" : "AM";

															return `${dayOfWeek}, ${monthNames[Number.parseInt(month) - 1]} ${Number.parseInt(day)}, ${year} at ${hour12}:${minutes} ${ampm}`;
														})()
													: `${formData.scheduledPickupDate} at ${formData.scheduledPickupTime}`}
											</p>
										</div>
										<div>
											<span className="text-gray-600">Passengers:</span>
											<p className="font-medium">
												{formData.passengerCount || 0} passenger
												{(formData.passengerCount || 0) !== 1 ? "s" : ""}
											</p>
										</div>
										<div>
											<span className="text-gray-600">Luggage:</span>
											<p className="font-medium">
												{formData.luggageCount || 0} piece
												{(formData.luggageCount || 0) !== 1 ? "s" : ""}
											</p>
										</div>
										<div>
											<span className="text-gray-600">Distance:</span>
											<p className="font-medium">
												{quoteData.distance?.toFixed(1)} km
											</p>
										</div>
										{secureQuoteData?.stops &&
											secureQuoteData.stops.length > 0 && (
												<div>
													<span className="text-gray-600">Stops:</span>
													<p className="font-medium">
														{secureQuoteData.stops.length} intermediate stop
														{secureQuoteData.stops.length > 1 ? "s" : ""}
													</p>
												</div>
											)}
										<div>
											<span className="text-gray-600">Estimated Fare:</span>
											<p className="font-medium text-primary">
												${quoteData.totalFare.toFixed(2)}
											</p>
										</div>
									</div>
									{formData.specialRequests && (
										<div>
											<span className="text-gray-600">Special Requests:</span>
											<p className="mt-1 rounded-lg border bg-gray-50 p-3 font-medium text-sm">
												{formData.specialRequests}
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Next Steps */}
						<Card>
							<CardContent className="p-4 text-center sm:p-6">
								<h3 className="mb-2 font-medium text-base sm:text-lg">
									What happens next?
								</h3>
								<p className="mb-4 text-gray-600 text-sm">
									Our team will review your booking and contact you within 24
									hours to confirm details and assign a driver.
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
												<Link to="/sign-up">
													Create Account to Track Bookings
												</Link>
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
		<div ref={scrollContainerRef as any} className="min-h-screen bg-gray-50">
			<div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">
				{/* Header */}
				<div className="mb-4 flex items-center gap-3 sm:mb-8 sm:gap-4">
					<Button variant="outline" size="icon" asChild>
						<Link to="/">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<h1 className="font-bold text-gray-900 text-xl sm:text-2xl lg:text-3xl">
							Complete Your Chauffeur Booking
						</h1>
						<p className="text-gray-600 text-sm sm:text-base">
							Based on your instant quote
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5 lg:gap-8">
					{/* Quote Information Panel - Left Side */}
					<div className="order-2 lg:order-1 lg:col-span-2">
						<div className="lg:sticky lg:top-8">
							<div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
								{/* Quote Header */}
								<div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 sm:h-64">
									<div className="text-center">
										<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
											<Calculator className="h-10 w-10 text-primary/60" />
										</div>
										<h2 className="mb-2 font-bold text-2xl text-gray-800">
											Your Quote
										</h2>
										<p className="px-4 text-gray-600 text-sm">
											Instant quote for your custom journey
										</p>
									</div>
								</div>

								<div className="p-8">
									{/* Price Display */}
									<div className="mb-8 text-center">
										<div className="inline-flex items-baseline gap-2 rounded-xl border border-primary/20 bg-primary/10 px-6 py-4">
											<span className="font-black text-4xl text-primary">
												${quoteData.totalFare.toFixed(2)}
											</span>
											<span className="font-medium text-primary/80 text-sm">
												estimated fare
											</span>
										</div>
										<div className="mt-3">
											<span className="inline-block rounded-full bg-primary/15 px-3 py-1 font-semibold text-primary text-xs">
												*Price based on instant quote
											</span>
										</div>
									</div>

									{/* Trip Details */}
									<div className="space-y-4">
										<h3 className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
											<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
												<MapPin className="h-3 w-3 text-primary" />
											</div>
											Trip Details
										</h3>

										<div className="space-y-3">
											{/* From */}
											<div className="flex items-center gap-3 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-4">
												<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
													<Navigation className="h-4 w-4 text-white" />
												</div>
												<div className="min-w-0 flex-1">
													<div className="mb-1 flex items-center gap-2">
														<span className="font-semibold text-green-700 text-xs uppercase tracking-wide">
															Pickup Location
														</span>
													</div>
													<div className="truncate font-medium text-gray-800 text-sm">
														{quoteData.origin}
													</div>
												</div>
											</div>

											{/* Route connector line */}
											{secureQuoteData?.stops &&
											secureQuoteData.stops.length > 0 ? (
												<div className="flex justify-center">
													<div className="h-4 w-px bg-gradient-to-b from-green-400 to-blue-400" />
												</div>
											) : (
												<div className="flex justify-center">
													<div className="h-4 w-px bg-gradient-to-b from-green-400 to-red-400" />
												</div>
											)}

											{/* Stops (if any) */}
											{secureQuoteData?.stops &&
												secureQuoteData.stops.length > 0 && (
													<>
														{secureQuoteData.stops.map(
															(stop: any, index: number) => (
																<div key={stop.id || index}>
																	<div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4">
																		<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
																			<CircleDot className="h-4 w-4 text-white" />
																		</div>
																		<div className="min-w-0 flex-1">
																			<div className="mb-1 flex items-center gap-2">
																				<span className="font-semibold text-blue-700 text-xs uppercase tracking-wide">
																					Stop {index + 1}
																				</span>
																			</div>
																			<div className="truncate font-medium text-gray-800 text-sm">
																				{stop.address}
																			</div>
																		</div>
																	</div>
																	{/* Connector to next item */}
																	{index < secureQuoteData.stops.length - 1 ? (
																		<div className="flex justify-center">
																			<div className="h-4 w-px bg-gradient-to-b from-blue-400 to-blue-400" />
																		</div>
																	) : (
																		<div className="flex justify-center">
																			<div className="h-4 w-px bg-gradient-to-b from-blue-400 to-red-400" />
																		</div>
																	)}
																</div>
															),
														)}
													</>
												)}

											{/* To */}
											<div className="flex items-center gap-3 rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-4">
												<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
													<MapPinned className="h-4 w-4 text-white" />
												</div>
												<div className="min-w-0 flex-1">
													<div className="mb-1 flex items-center gap-2">
														<span className="font-semibold text-red-700 text-xs uppercase tracking-wide">
															Drop-off Location
														</span>
													</div>
													<div className="truncate font-medium text-gray-800 text-sm">
														{quoteData.destination}
													</div>
												</div>
											</div>

											{/* Distance and Duration */}
											<div className="mt-4 flex items-center gap-3 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 p-4">
												<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-500">
													<Clock className="h-4 w-4 text-white" />
												</div>
												<div className="flex-1">
													<div className="mb-1 flex items-center gap-2">
														<span className="font-semibold text-purple-700 text-xs uppercase tracking-wide">
															Journey Details
														</span>
													</div>
													<div className="font-medium text-gray-800 text-sm">
														{quoteData.distance.toFixed(1)} km •{" "}
														{quoteData.duration} min
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Pre-selected Vehicle */}
									{quoteData.carId && (
										<div className="mt-6">
											<h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 text-lg">
												<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
													<Car className="h-3 w-3 text-primary" />
												</div>
												Pre-selected Vehicle
											</h3>
											<div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
												<div className="flex items-center gap-3">
													{carData?.images && carData.images.length > 0 ? (
														<div className="h-12 w-16 overflow-hidden rounded border bg-gray-200">
															<img
																src={
																	carData.images.find((img: any) => img.isMain)
																		?.url || carData.images[0].url
																}
																alt={carData.name}
																className="h-full w-full object-cover"
															/>
														</div>
													) : (
														<div className="flex h-12 w-16 items-center justify-center rounded border bg-primary/10">
															<Car className="h-6 w-6 text-primary/60" />
														</div>
													)}
													<div className="min-w-0 flex-1">
														{carLoading ? (
															<>
																<div className="font-medium text-gray-900 text-sm">
																	Loading vehicle details...
																</div>
																<div className="mt-1 text-muted-foreground text-xs">
																	Please wait
																</div>
															</>
														) : carData ? (
															<>
																<div className="font-medium text-gray-900 text-sm">
																	{carData.name}
																</div>
																<div className="mt-1 text-muted-foreground text-xs">
																	{carData.category?.name || "Premium Vehicle"}{" "}
																	• {carData.seatingCapacity} seats
																</div>
																{carData.features &&
																	carData.features.length > 0 && (
																		<div className="mt-1 flex flex-wrap gap-1">
																			{carData.features
																				.slice(0, 2)
																				.map((feature: any) => (
																					<Badge
																						key={feature.id}
																						variant="secondary"
																						className="px-1.5 py-0.5 text-xs"
																					>
																						{feature.name}
																					</Badge>
																				))}
																		</div>
																	)}
															</>
														) : (
															<>
																<div className="font-medium text-gray-900 text-sm">
																	Premium Vehicle
																</div>
																<div className="mt-1 text-muted-foreground text-xs">
																	Selected from your quote
																</div>
															</>
														)}
													</div>
												</div>
											</div>
										</div>
									)}

									{/* Fare Breakdown */}
									{secureQuoteData &&
										(secureQuoteData.firstKmFare ||
											secureQuoteData.additionalKmFare) && (
											<div className="mt-6">
												<h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 text-lg">
													<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
														<Calculator className="h-3 w-3 text-primary" />
													</div>
													Fare Breakdown
												</h3>
												<div className="space-y-2">
													{secureQuoteData.firstKmFare && (
														<div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
															<span className="text-gray-600 text-sm">
																First{" "}
																{secureQuoteData.breakdown?.firstKmDistance ||
																	10}
																km
															</span>
															<span className="font-medium text-sm">
																${secureQuoteData.firstKmFare.toFixed(2)}
															</span>
														</div>
													)}
													{secureQuoteData.additionalKmFare &&
														secureQuoteData.additionalKmFare > 0 && (
															<div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
																<span className="text-gray-600 text-sm">
																	Additional{" "}
																	{secureQuoteData.breakdown?.additionalDistance?.toFixed(
																		1,
																	) || 0}
																	km
																</span>
																<span className="font-medium text-sm">
																	${secureQuoteData.additionalKmFare.toFixed(2)}
																</span>
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
					<div className="order-1 lg:order-2 lg:col-span-3">
						<div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
							<div className="bg-primary p-4 sm:p-6 lg:p-8">
								<h1 className="mb-2 font-bold text-white text-xl sm:text-2xl lg:text-3xl">
									Book Your Chauffeur
								</h1>
								<p className="text-primary-foreground/90 text-sm sm:text-base">
									Complete your chauffeur booking in just a few steps
								</p>
							</div>

							<div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
								{/* Contact Information Section */}
								<div className="space-y-4 sm:space-y-6">
									<div className="flex items-center gap-3 sm:gap-4">
										<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary sm:h-10 sm:w-10">
											<span className="font-bold text-sm text-white sm:text-lg">
												1
											</span>
										</div>
										<div>
											<h3 className="font-bold text-gray-900 text-lg sm:text-xl">
												Contact Information
											</h3>
											<p className="text-gray-500 text-xs sm:text-sm">
												We'll use this to reach you about your booking
											</p>
										</div>
									</div>

									<div className="space-y-4 pl-0 sm:space-y-5 sm:pl-14">
										<div>
											<label className="mb-2 block font-semibold text-gray-800 text-sm sm:mb-3">
												Full Name *
											</label>
											<Input
												placeholder="Enter your full name"
												value={formData.customerName || ""}
												onChange={(e) =>
													updateFormData("customerName", e.target.value)
												}
												className={`h-10 w-full text-sm sm:h-12 sm:text-base ${formErrors.customerName ? "border-red-500" : ""}`}
											/>
											{formErrors.customerName && (
												<p className="mt-1 text-red-500 text-sm">
													{formErrors.customerName}
												</p>
											)}
										</div>

										<div>
											<label className="mb-2 block font-semibold text-gray-800 text-sm sm:mb-3">
												Email Address *
											</label>
											<Input
												type="email"
												placeholder="Enter your email"
												value={formData.customerEmail || ""}
												onChange={(e) =>
													updateFormData("customerEmail", e.target.value)
												}
												className={`h-10 w-full text-sm sm:h-12 sm:text-base ${formErrors.customerEmail ? "border-red-500" : ""}`}
											/>
											{formErrors.customerEmail && (
												<p className="mt-1 text-red-500 text-sm">
													{formErrors.customerEmail}
												</p>
											)}
										</div>

										<div>
											<label className="mb-2 block font-semibold text-gray-800 text-sm sm:mb-3">
												Phone Number *
											</label>
											<Input
												type="tel"
												placeholder="Enter your phone number"
												value={formData.customerPhone || ""}
												onChange={(e) =>
													updateFormData("customerPhone", e.target.value)
												}
												className={`h-10 w-full text-sm sm:h-12 sm:text-base ${formErrors.customerPhone ? "border-red-500" : ""}`}
											/>
											{formErrors.customerPhone && (
												<p className="mt-1 text-red-500 text-sm">
													{formErrors.customerPhone}
												</p>
											)}
										</div>
									</div>
								</div>

								{/* Booking Details Section */}
								<div className="space-y-4 sm:space-y-6">
									<div className="flex items-center gap-3 sm:gap-4">
										<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-green-600 sm:h-10 sm:w-10">
											<span className="font-bold text-sm text-white sm:text-lg">
												2
											</span>
										</div>
										<div>
											<h3 className="font-bold text-gray-900 text-lg sm:text-xl">
												Booking Details
											</h3>
											<p className="text-gray-500 text-xs sm:text-sm">
												Tell us about your chauffeur service needs
											</p>
										</div>
									</div>

									<div className="space-y-4 pl-0 sm:space-y-5 sm:pl-14">
										{/* Passengers and Luggage side by side */}
										<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
											<div>
												<label className="mb-1 block font-semibold text-gray-800 text-sm">
													Number of Passengers *
												</label>
												<p className="mb-2 text-gray-600 text-xs sm:mb-3">
													Maximum capacity: {carData?.seatingCapacity || 8}{" "}
													passengers
												</p>
												<Input
													type="number"
													min="1"
													max={carData?.seatingCapacity || 8}
													placeholder="e.g. 2"
													value={formData.passengerCount || ""}
													onChange={(e) =>
														updateFormData(
															"passengerCount",
															e.target.value
																? Number.parseInt(e.target.value)
																: undefined,
														)
													}
													className={`h-10 w-full text-sm sm:h-12 sm:text-base ${formErrors.passengerCount ? "border-red-500" : ""}`}
												/>
												{formErrors.passengerCount && (
													<p className="mt-1 text-red-500 text-sm">
														{formErrors.passengerCount}
													</p>
												)}
											</div>

											<div>
												<label className="mb-1 block font-semibold text-gray-800 text-sm">
													Luggage Pieces *
												</label>
												<p className="mb-2 text-gray-600 text-xs sm:mb-3">
													Maximum capacity: {carData?.luggageCapacity || 10}{" "}
													pieces of luggage
												</p>
												<Input
													type="number"
													min="0"
													max={carData?.luggageCapacity || 10}
													placeholder="e.g. 3"
													value={formData.luggageCount || ""}
													onChange={(e) =>
														updateFormData(
															"luggageCount",
															e.target.value
																? Number.parseInt(e.target.value)
																: undefined,
														)
													}
													className={`h-10 w-full text-sm sm:h-12 sm:text-base ${formErrors.luggageCount ? "border-red-500" : ""}`}
												/>
												{formErrors.luggageCount && (
													<p className="mt-1 text-red-500 text-sm">
														{formErrors.luggageCount}
													</p>
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
													const month = String(
														selectedDate.getMonth() + 1,
													).padStart(2, "0");
													const day = String(selectedDate.getDate()).padStart(
														2,
														"0",
													);
													const localDateString = `${year}-${month}-${day}`;
													updateFormData(
														"scheduledPickupDate",
														localDateString,
													);
												}
											}}
											onTimeChange={(time) =>
												updateFormData("scheduledPickupTime", time)
											}
											dateError={formErrors.scheduledPickupDate}
											timeError={formErrors.scheduledPickupTime}
											dateLabel="Pickup Date *"
											timeLabel="Pickup Time *"
											allowPastTimes={true}
										/>

										<div>
											<label className="mb-3 block font-semibold text-gray-800 text-sm">
												Special Requirements{" "}
												<span className="font-normal text-gray-400">
													(Optional)
												</span>
											</label>
											<Textarea
												placeholder="Any special requests, accessibility needs, or requirements..."
												value={formData.specialRequests || ""}
												onChange={(e) =>
													updateFormData("specialRequests", e.target.value)
												}
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
													Chauffeur Service Price
												</span>
												<p className="text-gray-600 text-sm">
													Based on your instant quote
												</p>
											</div>
											<span className="font-bold text-2xl text-primary">
												${quoteData.totalFare.toFixed(2)}
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
															• Your card will be authorized now (payment held)
														</li>
														<li>
															• You will be charged after your trip is completed
														</li>
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
										className="h-12 w-full font-bold text-base sm:h-14 sm:text-lg"
										disabled={
											createBookingMutation.isPending ||
											createGuestBookingMutation.isPending
										}
									>
										{createBookingMutation.isPending ||
										createGuestBookingMutation.isPending ? (
											<>
												<Loader2 className="mr-3 h-6 w-6 animate-spin" />
												Creating booking...
											</>
										) : sessionData?.user ? (
											"Continue to Payment"
										) : isGuestFlow ? (
											"Continue to Payment"
										) : (
											"Sign In & Book"
										)}
									</Button>

									{/* Help Messages */}
									{(createBookingMutation.isPending ||
										createGuestBookingMutation.isPending) && (
										<div className="mt-2 rounded bg-yellow-50 p-2 text-sm text-yellow-800">
											<div>📤 Processing your booking...</div>
										</div>
									)}

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
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
