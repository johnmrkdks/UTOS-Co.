import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCalculateInstantQuoteMutation = () => {
	return useMutation({
		mutationFn: async (input: any) => {
			// Use car-specific endpoint if carId is provided, otherwise use general endpoint
			if (input.carId) {
				return await trpc.instantQuote.calculateCarSpecific.mutate(input);
			} else {
				return await trpc.instantQuote.calculate.mutate(input);
			}
		},
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
	});
};
