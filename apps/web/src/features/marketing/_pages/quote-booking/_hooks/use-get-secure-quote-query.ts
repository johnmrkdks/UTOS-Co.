import { useQuery } from "@tanstack/react-query";

export function useGetSecureQuoteQuery(quoteId: string, options?: { enabled?: boolean }) {
	// Use the same format as quote-results page for consistency
	return useQuery({
		queryKey: ["instantQuote.getQuoteById", quoteId],
		queryFn: async () => {
			console.log("🔐 Fetching secure quote for ID:", quoteId);
			
			try {
				const response = await fetch(`http://localhost:3000/trpc/instantQuote.getQuoteById?batch=1&input=${encodeURIComponent(JSON.stringify({ "0": { quoteId } }))}`);
				
				if (!response.ok) {
					throw new Error(`Failed to fetch quote: ${response.status} - ${response.statusText}`);
				}
				
				const data = await response.json();
				console.log("🔐 API Response:", data);
				
				if (data[0]?.error) {
					console.error("🔐 API returned error:", data[0].error);
					throw new Error(data[0].error.message || "Quote not found");
				}
				
				const result = data[0]?.result?.data;
				console.log("🔐 Retrieved secure quote data:", result);
				
				if (!result) {
					throw new Error("No quote data returned from server");
				}
				
				return result;
			} catch (error) {
				console.error("Error fetching secure quote:", error);
				throw error;
			}
		},
		enabled: options?.enabled ?? true,
		retry: false,
	});
}