import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export function useGetSecureQuoteQuery(quoteId: string, options?: { enabled?: boolean }) {
	// Test if this specific endpoint exists by checking the trpc client structure
	console.log("🔍 Debugging tRPC client:", {
		hasInstantQuote: !!trpc.instantQuote,
		hasGetQuoteById: !!(trpc.instantQuote as any)?.getQuoteById,
		hasQueryOptions: !!(trpc.instantQuote as any)?.getQuoteById?.queryOptions,
	});
	
	// For now, make a direct API call until tRPC client issue is resolved
	return useQuery({
		queryKey: ['instant-quote-direct', quoteId],
		queryFn: async () => {
			console.log("🔐 Fetching secure quote for ID:", quoteId);
			
			try {
				// Direct API call to the tRPC endpoint
				const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
				const url = `${serverUrl}/trpc/instantQuote.getQuoteById?input=${encodeURIComponent(JSON.stringify({ quoteId }))}`;
				
				const response = await fetch(url, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				});
				
				if (!response.ok) {
					throw new Error(`Failed to fetch quote: ${response.status}`);
				}
				
				const data = await response.json();
				console.log("🔐 Retrieved secure quote data:", data);
				
				return data.result?.data || null;
			} catch (error) {
				console.error("Error fetching secure quote:", error);
				throw error;
			}
		},
		enabled: options?.enabled ?? true,
		retry: false,
	});
}