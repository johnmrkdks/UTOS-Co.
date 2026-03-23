import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCalculateInstantQuoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.instantQuote.calculate.mutationOptions({
		onSuccess: (data) => {
			console.log("🔐 Secure quote calculated with ID:", data?.quoteId);
			toast.success("Quote Calculated", {
				description: `Total fare: $${(data?.totalAmount ? data.totalAmount.toFixed(2) : '0.00')}`,
			});
		},
		onError: (error) => {
			console.error("Error calculating secure quote:", error);
			const msg = error?.message || "Please try again or check your addresses.";
			toast.error("Failed to calculate quote", {
				description: msg,
			});
		},
	}));
};
