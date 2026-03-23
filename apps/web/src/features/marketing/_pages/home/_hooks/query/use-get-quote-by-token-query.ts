import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export function useGetQuoteByTokenQuery(quoteToken?: string) {
	return useQuery({
		queryKey: ["quote-by-token", quoteToken],
		queryFn: () => {
			if (!quoteToken) {
				throw new Error("Quote token is required");
			}
			// Use the trpc client directly to avoid type issues
			return (trpc as any).instantQuote.getQuoteByToken.query({ quoteToken });
		},
		enabled: !!quoteToken,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
		retry: false,
	});
}
