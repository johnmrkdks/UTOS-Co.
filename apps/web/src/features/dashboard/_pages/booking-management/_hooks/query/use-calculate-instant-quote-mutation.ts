import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCalculateInstantQuoteMutation = () => {
	return useMutation(trpc.bookings.calculateInstantQuote.mutationOptions({
		onSuccess: (data) => {
			toast.success(`Quote calculated: $${(data.totalAmount / 100).toFixed(2)}`);
		},
		onError: (error) => {
			toast.error("Error while calculating quote", {
				description: error.message,
			});
		},
	}));
};