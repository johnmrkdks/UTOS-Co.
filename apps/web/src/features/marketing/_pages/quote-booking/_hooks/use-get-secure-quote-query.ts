import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export function useGetSecureQuoteQuery(quoteId: string, options?: { enabled?: boolean }) {
	// Use the same format as quote-results page for consistency
	return useQuery(
		trpc.instantQuote.getQuoteById.queryOptions({
			quoteId: quoteId
		}))
}
