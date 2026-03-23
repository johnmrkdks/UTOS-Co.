import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useCalculateInstantQuoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: any) => {
			// Use queryClient.fetchQuery since calculateInstantQuote is a query, not a mutation
			return await queryClient.fetchQuery(
				trpc.bookings.calculateInstantQuote.queryOptions(input),
			);
		},
		onSuccess: (data) => {
			const totalAmount = data?.totalAmount || 0;
			const formattedAmount =
				typeof totalAmount === "number" ? totalAmount.toFixed(2) : "0.00";
			toast.success(`Quote calculated: $${formattedAmount}`);
		},
		onError: (error: any) => {
			toast.error("Error while calculating quote", {
				description: error.message,
			});
		},
	});
};
