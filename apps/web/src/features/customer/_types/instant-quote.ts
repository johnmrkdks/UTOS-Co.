export type Step = "input" | "results" | "car-selection" | "booking-details" | "confirmation" | "processing" | "success";

export interface Stop {
	id: string;
	address: string;
	duration?: number;
}

export interface QuoteResult {
	totalAmount: number;
	firstKmFare: number;
	additionalKmFare: number;
	estimatedDistance: number;
	estimatedDuration: number;
	breakdown: {
		firstKmRate: number;
		additionalKmRate: number;
		totalDistance: number;
		firstKmDistance: number;
		additionalDistance: number;
	};
	quoteToken?: string;
}

export interface RouteData {
	originAddress: string;
	destinationAddress: string;
	originLatitude: number;
	originLongitude: number;
	destinationLatitude: number;
	destinationLongitude: number;
	stops: Stop[];
	passengerCount?: number;
	luggageCount?: number;
}