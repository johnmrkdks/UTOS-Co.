import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { QuoteBookingPage } from "@/features/marketing/_pages/quote-booking/quote-booking-page";

const bookQuoteSearchSchema = z.object({
	// Legacy URL parameters (for backward compatibility, will be removed later)
	quote: z.string().optional(),
	origin: z.string().optional(),
	destination: z.string().optional(),
	distance: z.string().optional(),
	duration: z.string().optional(),
	totalFare: z.string().optional(),
	carId: z.string().optional(),
	// Guest booking flow (no account required)
	guest: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/book-quote/$quoteId")({
	validateSearch: bookQuoteSearchSchema,
	component: BookQuotePageComponent,
});

function BookQuotePageComponent() {
	const { quoteId } = useParams({ from: "/_marketing/book-quote/$quoteId" });
	const search = useSearch({ from: "/_marketing/book-quote/$quoteId" });
	return (
		<QuoteBookingPage
			isCustomerArea={false}
			pathQuoteId={quoteId}
			isGuestFlow={search.guest === "1"}
		/>
	);
}
