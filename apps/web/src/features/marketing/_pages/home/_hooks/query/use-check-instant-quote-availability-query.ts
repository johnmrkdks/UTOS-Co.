import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export function useCheckInstantQuoteAvailabilityQuery() {
	return useQuery(trpc.instantQuote.checkAvailability.queryOptions());
}
