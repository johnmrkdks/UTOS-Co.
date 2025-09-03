import { createFileRoute, useParams } from "@tanstack/react-router";
import { QuoteBookingPage } from "@/features/marketing/_pages/quote-booking/quote-booking-page";

export const Route = createFileRoute("/customer/_layout/book-quote/$quoteId")({
	component: CustomerQuoteBookingPage,
});

function CustomerQuoteBookingPage() {
	const { quoteId } = useParams({ from: "/customer/_layout/book-quote/$quoteId" });
	return <QuoteBookingPage isCustomerArea={true} pathQuoteId={quoteId} />;
}