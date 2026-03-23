import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export function useGetSecureQuoteQuery(
	quoteId: string,
	options?: { enabled?: boolean },
) {
	// Use the same format as quote-results page for consistency
	return useQuery({
		...trpc.instantQuote.getQuoteById.queryOptions({
			quoteId: quoteId,
		}),
		enabled: options?.enabled ?? true,
	});
}
