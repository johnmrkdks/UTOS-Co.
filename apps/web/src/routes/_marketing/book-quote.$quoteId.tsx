import { createFileRoute, useParams } from "@tanstack/react-router";
import { QuoteBookingPage } from "@/features/marketing/_pages/quote-booking/quote-booking-page";
import { z } from "zod";

const bookQuoteSearchSchema = z.object({
	// Legacy URL parameters (for backward compatibility, will be removed later)
	quote: z.string().optional(),
	origin: z.string().optional(),
	destination: z.string().optional(),
	distance: z.string().optional(),
	duration: z.string().optional(),
	totalFare: z.string().optional(),
	carId: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/book-quote/$quoteId")({
	validateSearch: bookQuoteSearchSchema,
	component: BookQuotePageComponent,
});

function BookQuotePageComponent() {
	const { quoteId } = useParams({ from: "/_marketing/book-quote/$quoteId" });
	console.log("🎯 BookQuotePageComponent - quoteId from params:", quoteId);
	console.log("🎯 BookQuotePageComponent - route matched");
	return <QuoteBookingPage isCustomerArea={false} pathQuoteId={quoteId} />;
}