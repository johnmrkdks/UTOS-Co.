import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export function useCheckInstantQuoteAvailabilityQuery() {
	return useQuery(trpc.instantQuote.checkAvailability.queryOptions());
}
