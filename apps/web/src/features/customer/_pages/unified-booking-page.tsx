import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { useGetQuoteByTokenQuery } from "@/features/marketing/_pages/home/_hooks/query/use-get-quote-by-token-query";
import { useGetAvailableCarsQuery } from "@/features/customer/_hooks/query/use-get-available-cars-query";
import { useCreateCustomBookingFromQuoteMutation } from "@/features/marketing/_pages/home/_hooks/mutation/use-create-custom-booking-from-quote-mutation";
import { useInstantQuoteFlow } from "../_hooks/use-instant-quote-flow";
import { InstantQuoteInput } from "../_components/instant-quote-input";
import { InstantQuoteResults } from "../_components/instant-quote-results";
import { CarSelectionStep } from "../_components/car-selection-step";
import { BookingDetailsStep } from "../_components/booking-details-step";
import { BookingConfirmationStep } from "../_components/booking-confirmation-step";
import { BookingSuccessStep } from "../_components/booking-success-step";
import { type QuoteResult, type RouteData, type Step } from "../_types/instant-quote";
import { type BookingDetailsFormData } from "../_schemas/instant-quote";

export function UnifiedBookingPage() {
	const search = useSearch({ from: "/dashboard/_layout/book-appointment" });
	const { from, token: quoteToken, carId } = search as { 
		from?: "instant-quote", 
		token?: string, 
		carId?: string 
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
	const { data: tokenQuoteData, isLoading: isLoadingToken } = useGetQuoteByTokenQuery(
		from === "instant-quote" ? quoteToken : undefined
	);
	
	// Load available cars for selection
	const { data: availableCars } = useGetAvailableCarsQuery();
	
	// Booking mutation
	const createBookingMutation = useCreateCustomBookingFromQuoteMutation();

	// Determine initial step based on entry point
	const initialStep: Step = useMemo(() => {
		if (from === "instant-quote") {
			// Coming from instant quote - start with car selection
			return "car-selection";
		} else if (carId) {
			// Direct car booking - start with route input (car already selected)
			return "input";
		} else {
			// General booking - start with car selection
			return "car-selection";
		}
	}, [from, carId]);

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
		initialStep
	]);

	// Find selected car details
	const selectedCar = useMemo(() => {
		return availableCars?.data?.find(car => car.id === selectedCarId);
	}, [availableCars?.data, selectedCarId]);

	// Booking details state
	const [bookingDetails, setBookingDetails] = useState<BookingDetailsFormData | null>(null);
	const [completedBookingId, setCompletedBookingId] = useState<string>("");

	const handleQuoteCalculated = (newQuote: QuoteResult, newRouteData: RouteData) => {
		setQuote(newQuote);
		setRouteData(newRouteData);
		// If car is already selected (direct booking), go to booking details
		if (selectedCarId) {
			goToStep("booking-details");
		} else {
			// Otherwise go to car selection
			goToStep("car-selection");
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
			
			const result = await createBookingMutation.mutateAsync({
				quoteToken: quote.quoteToken || "",
				...bookingDetails,
			});

			setCompletedBookingId(result.id);
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
			<div className="container max-w-4xl mx-auto p-4">
				<div className="animate-pulse">
					<div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
					<div className="h-64 bg-muted rounded"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="container max-w-4xl mx-auto p-4">
			{/* Input step - for route calculation */}
			{currentStep === "input" && (
				<InstantQuoteInput
					initialData={routeData ? {
						originAddress: routeData.originAddress,
						destinationAddress: routeData.destinationAddress,
						stops: routeData.stops,
						originLatitude: routeData.originLatitude,
						originLongitude: routeData.originLongitude,
						destinationLatitude: routeData.destinationLatitude,
						destinationLongitude: routeData.destinationLongitude,
					} : undefined}
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
						// Determine where to go back based on entry point
						if (from === "instant-quote" || routeData) {
							goToStep("results");
						} else {
							goToStep("input");
						}
					}}
					onNext={() => goToStep("booking-details")}
					instantQuote={quote}
					routeData={routeData}
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
			{currentStep === "confirmation" && quote && routeData && bookingDetails && (
				<BookingConfirmationStep
					bookingDetails={bookingDetails}
					quote={quote}
					routeData={routeData}
					selectedCar={selectedCar}
					onConfirm={handleBookingConfirm}
					onBack={() => goToStep("booking-details")}
					isProcessing={currentStep === "processing"}
				/>
			)}

			{/* Processing step */}
			{currentStep === "processing" && (
				<div className="flex items-center justify-center py-20">
					<div className="text-center space-y-4">
						<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
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