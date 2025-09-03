import { createFileRoute } from "@tanstack/react-router";
import { CalculateQuotePage } from "@/features/marketing/_pages/calculate-quote/calculate-quote-page";
import { z } from "zod";

const calculateQuoteSearchSchema = z.object({
	origin: z.string().optional(),
	destination: z.string().optional(),
	originLat: z.string().optional(),
	originLng: z.string().optional(),
	destinationLat: z.string().optional(),
	destinationLng: z.string().optional(),
	stops: z.string().optional(), // JSON string of stops
	selectedCarId: z.string(),
});

export const Route = createFileRoute("/_marketing/calculate-quote")({
	validateSearch: calculateQuoteSearchSchema,
	component: () => <CalculateQuotePage isCustomerArea={false} />,
});