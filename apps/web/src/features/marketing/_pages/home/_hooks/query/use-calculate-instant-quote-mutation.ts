import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCalculateInstantQuoteMutation = () => {
	return useMutation(trpc.instantQuote.calculate.mutationOptions({
		onSuccess: (data: any) => {
			toast.success("Quote Calculated", {
				description: `Total fare: $${(data.totalAmount / 100).toFixed(2)}`,
			});
		},
		onError: (error: any) => {
			console.error("Error calculating quote:", error);
			toast.error("Failed to calculate quote", {
				description: "Please try again or check your addresses.",
			});
		},
	}));
};
