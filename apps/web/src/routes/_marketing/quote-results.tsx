import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { QuoteResultsPage } from "@/features/marketing/_pages/quote-results/quote-results-page";

const quoteResultsSearchSchema = z.object({
	quoteId: z.string(),
});

export const Route = createFileRoute("/_marketing/quote-results")({
	validateSearch: quoteResultsSearchSchema,
	component: () => <QuoteResultsPage isCustomerArea={false} />,
});
