export type Step = "input" | "results" | "car-selection" | "booking-details" | "confirmation" | "processing" | "success";

export interface Stop {
	id: string;
	address: string;
	duration?: number;
}

export interface QuoteResult {
	totalAmount: number;
	baseFare: number;
	distanceFare: number;
	timeFare: number;
	extraCharges: number;
	estimatedDistance: number;
	estimatedDuration: number;
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
}