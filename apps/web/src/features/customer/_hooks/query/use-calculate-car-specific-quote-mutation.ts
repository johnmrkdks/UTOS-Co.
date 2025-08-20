import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCalculateCarSpecificQuoteMutation() {
	const queryClient = useQueryClient();
	
	return useMutation({
		mutationFn: trpc.instantQuote.calculateCarSpecific.mutate,
		onSuccess: () => {
			// Invalidate relevant queries if needed
		},
		onError: (error) => {
			console.error("Car-specific quote calculation failed:", error);
		},
	});
}