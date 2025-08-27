import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCalculateInstantQuoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: any) => {
			// Create a manual query client call for the calculateInstantQuote query
			return await queryClient.fetchQuery(
				trpc.bookings.calculateInstantQuote.queryOptions(input)
			);
		},
		onSuccess: (data) => {
			toast.success("Quote Calculated", {
				description: `Total fare: $${(data?.totalAmount ? data.totalAmount.toFixed(2) : '0.00')}`,
			});
		},
		onError: (error) => {
			console.error("Error calculating quote:", error);
			toast.error("Failed to calculate quote", {
				description: "Please try again or check your addresses.",
			});
		},
	});
};
