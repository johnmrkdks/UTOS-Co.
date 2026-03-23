import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useGetAvailableCarsQuery } from "@/features/customer/_hooks/query/use-get-available-cars-query";
import { useCreateCustomBookingFromQuoteMutation } from "@/features/marketing/_pages/home/_hooks/mutation/use-create-custom-booking-from-quote-mutation";
import { useGetQuoteByTokenQuery } from "@/features/marketing/_pages/home/_hooks/query/use-get-quote-by-token-query";
import {
	BookingAuthChoiceStep,
	clearPersistedQuote,
	getPersistedQuote,
	persistQuoteForRedirect,
} from "../_components/booking-auth-choice-step";
import { BookingConfirmationStep } from "../_components/booking-confirmation-step";
import { BookingDetailsStep } from "../_components/booking-details-step";
import { BookingSuccessStep } from "../_components/booking-success-step";
import { CarSelectionStep } from "../_components/car-selection-step";
import { InstantQuoteInput } from "../_components/instant-quote-input";
import { InstantQuoteResults } from "../_components/instant-quote-results";
import { useInstantQuoteFlow } from "../_hooks/use-instant-quote-flow";
import type { BookingDetailsFormData } from "../_schemas/instant-quote";
import type { QuoteResult, RouteData, Step } from "../_types/instant-quote";

export function UnifiedBookingPage() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/dashboard/_layout/book-appointment" });
	const {
		from,
		token: quoteToken,
		carId,
		restore,
	} = search as {
		from?: "instant-quote";
		token?: string;
		carId?: string;
		restore?: string;
	};

	const {
		currentStep,
		quote,
		routeData,
		selectedCarId,
		goToStep,
		resetFlow,
		startBookingFlow,
		setQuote,
		setRouteData,
		setSelectedCarId,
	} = useInstantQuoteFlow();

	// Load quote from token if provided (coming from instant quote)
	const { data: tokenQuoteData, isLoading: isLoadingToken } =
		useGetQuoteByTokenQuery(from === "instant-quote" ? quoteToken : undefined);

	// Load available cars for selection
	const { data: availableCars } = useGetAvailableCarsQuery();

	// Booking mutation
	const createBookingMutation = useCreateCustomBookingFromQuoteMutation();

	// Determine initial step based on entry point
	const initialStep: Step = useMemo(() => {
		if (from === "instant-quote") {
			// Coming from instant quote - show results (quote) then auth choice on Book
			return "results";
		}
		if (carId) {
			// Direct car booking - start with route input (car already selected)
			return "input";
		}
		// General booking - start with car selection
		return "car-selection";
	}, [from, carId]);

	// Restore quote from sessionStorage when returning from sign-up
	useEffect(() => {
		if (restore === "1" && !quote) {
			const persisted = getPersistedQuote();
			if (persisted?.quote && persisted?.routeData) {
				setQuote(persisted.quote as QuoteResult);
				setRouteData(persisted.routeData as RouteData);
				if (persisted.selectedCarId) setSelectedCarId(persisted.selectedCarId);
				// If they had selected a car before sign-up, go to booking details; else car selection
				goToStep(persisted.selectedCarId ? "booking-details" : "car-selection");
				clearPersistedQuote();
			}
		}
	}, [restore, quote, setQuote, setRouteData, setSelectedCarId, goToStep]);

	// Set initial step and data on mount
	useEffect(() => {
		// Set initial step
		if (currentStep === "input" && initialStep !== "input") {
			goToStep(initialStep);
		}

		// Handle instant quote data loading
		if (tokenQuoteData && from === "instant-quote" && !quote) {
			setQuote(tokenQuoteData.quote);
			setRouteData(tokenQuoteData.routeData);
		}

		// Handle direct car selection
		if (carId && !selectedCarId) {
			setSelectedCarId(carId);
		}
	}, [
		tokenQuoteData,
		quote,
		setQuote,
		setRouteData,
		goToStep,
		from,
		carId,
		selectedCarId,
		setSelectedCarId,
		currentStep,
		initialStep,
	]);

	// Find selected car details
	const selectedCar = useMemo(() => {
		return availableCars?.data?.find((car) => car.id === selectedCarId);
	}, [availableCars?.data, selectedCarId]);

	// Booking details state
	const [bookingDetails, setBookingDetails] =
		useState<BookingDetailsFormData | null>(null);
	const [completedBookingId, setCompletedBookingId] = useState<string>("");

	const handleQuoteCalculated = (
		newQuote: QuoteResult,
		newRouteData: RouteData,
	) => {
		setQuote(newQuote);
		setRouteData(newRouteData);
		// If car is already selected (direct booking), go to auth choice then booking details
		if (selectedCarId) {
			goToStep("auth-choice");
		} else {
			// Otherwise show results, then auth choice on "Book" → car selection
			goToStep("results");
		}
	};

	const handleCarSelected = (newCarId: string) => {
		setSelectedCarId(newCarId);
		// If we have route data, go to booking details
		if (routeData) {
			goToStep("booking-details");
		} else {
			// Otherwise go to route input
			goToStep("input");
		}
	};

	const handleBookingDetailsSubmit = (details: BookingDetailsFormData) => {
		setBookingDetails(details);
		goToStep("confirmation");
	};

	const handleBookingConfirm = async () => {
		if (!quote || !routeData || !bookingDetails) return;

		try {
			goToStep("processing");

			// Build full payload from quote, routeData, and bookingDetails
			const payload = {
				// Route from quote/routeData
				originAddress: routeData.originAddress,
				originLatitude: routeData.originLatitude,
				originLongitude: routeData.originLongitude,
				destinationAddress: routeData.destinationAddress,
				destinationLatitude: routeData.destinationLatitude,
				destinationLongitude: routeData.destinationLongitude,
				stops:
					routeData.stops?.map((s) => ({
						address: s.address,
						latitude: undefined,
						longitude: undefined,
					})) || [],
				// Pricing from quote (amounts already in dollars)
				baseFare: quote.firstKmFare ?? quote.baseFare ?? 0,
				distanceFare: quote.additionalKmFare ?? quote.distanceFare ?? 0,
				timeFare: quote.timeFare ?? 0,
				extraCharges: quote.extraCharges ?? 0,
				quotedAmount: quote.totalAmount ?? 0,
				estimatedDistance: quote.estimatedDistance,
				estimatedDuration: quote.estimatedDuration,
				// Customer details
				...bookingDetails,
				scheduledPickupTime: bookingDetails.scheduledPickupTime.toISOString(),
				preferredCarId: selectedCarId || undefined,
				tollPreference: bookingDetails.tollPreference ?? "toll",
			};

			const result = await (createBookingMutation as any).mutateAsync(payload);

			setCompletedBookingId(result?.id || "");
			goToStep("success");
			toast.success("Booking confirmed successfully!");
		} catch (error) {
			console.error("Booking failed:", error);
			toast.error("Failed to create booking. Please try again.");
			goToStep("confirmation");
		}
	};

	// Loading state for token
	if (isLoadingToken) {
		return (
			<div className="container mx-auto max-w-4xl p-4">
				<div className="animate-pulse">
					<div className="mb-4 h-8 w-1/3 rounded bg-muted" />
					<div className="h-64 rounded bg-muted" />
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl p-4">
			{/* Input step - for route calculation */}
			{currentStep === "input" && (
				<InstantQuoteInput
					initialData={
						routeData
							? {
									originAddress: routeData.originAddress,
									destinationAddress: routeData.destinationAddress,
									stops: routeData.stops,
									originLatitude: routeData.originLatitude,
									originLongitude: routeData.originLongitude,
									destinationLatitude: routeData.destinationLatitude,
									destinationLongitude: routeData.destinationLongitude,
								}
							: undefined
					}
					onQuoteCalculated={handleQuoteCalculated}
				/>
			)}

			{/* Results step - show quote results (optional step) */}
			{currentStep === "results" && quote && routeData && (
				<InstantQuoteResults
					quote={quote}
					routeData={routeData}
					onBookJourney={startBookingFlow}
					onGetNewQuote={resetFlow}
				/>
			)}

			{/* Car selection step */}
			{currentStep === "car-selection" && (
				<CarSelectionStep
					selectedCarId={selectedCarId}
					onCarSelect={handleCarSelected}
					onBack={() => {
						// If we have quote (from results → auth → car flow), back goes to auth-choice
						if (quote && routeData) {
							goToStep("auth-choice");
						} else if (from === "instant-quote") {
							goToStep("results");
						} else {
							goToStep("input");
						}
					}}
					onNext={() => goToStep("auth-choice")}
					instantQuote={quote || undefined}
					routeData={routeData || undefined}
				/>
			)}

			{/* Auth choice step: guest vs create account (shown right after quote) */}
			{currentStep === "auth-choice" && (
				<BookingAuthChoiceStep
					onContinueAsGuest={() =>
						goToStep(selectedCarId ? "booking-details" : "car-selection")
					}
					onCreateAccount={() => {
						persistQuoteForRedirect({
							quote: quote!,
							routeData: routeData!,
							selectedCarId,
							step: "auth-choice",
						});
						navigate({
							to: "/sign-up",
							search: { redirect: "/dashboard/book-appointment?restore=1" },
						});
					}}
					onBack={() => goToStep(selectedCarId ? "car-selection" : "results")}
				/>
			)}

			{/* Booking details step */}
			{currentStep === "booking-details" && (
				<BookingDetailsStep
					selectedCarId={selectedCarId}
					onSubmit={handleBookingDetailsSubmit}
					onBack={() => goToStep("car-selection")}
					isSubmitting={false}
				/>
			)}

			{/* Confirmation step */}
			{currentStep === "confirmation" &&
				quote &&
				routeData &&
				bookingDetails && (
					<BookingConfirmationStep
						bookingDetails={bookingDetails}
						quote={quote}
						routeData={routeData}
						selectedCar={selectedCar}
						onConfirm={handleBookingConfirm}
						onBack={() => goToStep("booking-details")}
						isProcessing={false}
					/>
				)}

			{/* Processing step */}
			{currentStep === "processing" && (
				<div className="flex items-center justify-center py-20">
					<div className="space-y-4 text-center">
						<div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="text-muted-foreground">Processing your booking...</p>
					</div>
				</div>
			)}

			{/* Success step */}
			{currentStep === "success" && (
				<BookingSuccessStep
					bookingId={completedBookingId}
					onStartNewQuote={resetFlow}
				/>
			)}
		</div>
	);
}
