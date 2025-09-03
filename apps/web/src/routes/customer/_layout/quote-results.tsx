import { createFileRoute } from "@tanstack/react-router";
import { QuoteResultsPage } from "@/features/marketing/_pages/quote-results/quote-results-page";

export const Route = createFileRoute("/customer/_layout/quote-results")({
	component: CustomerQuoteResultsPage,
});

function CustomerQuoteResultsPage() {
	return <QuoteResultsPage isCustomerArea={true} />;
}