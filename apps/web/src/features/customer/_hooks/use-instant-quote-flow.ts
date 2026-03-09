import { useState } from "react";
import { type Step, type QuoteResult, type RouteData } from "../_types/instant-quote";

export function useInstantQuoteFlow() {
	const [currentStep, setCurrentStep] = useState<Step>("input");
	const [quote, setQuote] = useState<QuoteResult | null>(null);
	const [routeData, setRouteData] = useState<RouteData | null>(null);
	const [selectedCarId, setSelectedCarId] = useState<string>("");

	const goToStep = (step: Step) => {
		setCurrentStep(step);
	};

	const resetFlow = () => {
		setCurrentStep("input");
		setQuote(null);
		setRouteData(null);
		setSelectedCarId("");
	};

	const startBookingFlow = () => {
		setCurrentStep("auth-choice");
	};

	return {
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
	};
}