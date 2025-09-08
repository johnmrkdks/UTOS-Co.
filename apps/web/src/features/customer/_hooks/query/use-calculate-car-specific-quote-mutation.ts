import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCalculateCarSpecificQuoteMutation() {
	const queryClient = useQueryClient();

	return useMutation(trpc.instantQuote.calculateCarSpecific.mutationOptions({
		onSuccess: (data) => {
			queryClient.setQueryData(["car-specific-quote"], data);
		},
		onError: (error) => {
			console.error("Car-specific quote calculation failed:", error);
		},
	}))
}
