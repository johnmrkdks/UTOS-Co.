import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCloseTripWithExtrasByShareTokenMutation = (shareToken: string) => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.bookings.closeTripWithExtrasByShareToken.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.getByShareToken.queryKey({ shareToken }),
				});
				toast.success("Trip extras submitted. Admin will finalize the amount.");
			},
			onError: (error) => {
				toast.error("Failed to submit", { description: error.message });
			},
		})
	);
};

export const useCloseTripWithoutExtrasByShareTokenMutation = (shareToken: string) => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.bookings.closeTripWithoutExtrasByShareToken.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.getByShareToken.queryKey({ shareToken }),
				});
				toast.success("Trip submitted. Admin will finalize the amount.");
			},
			onError: (error) => {
				toast.error("Failed to submit", { description: error.message });
			},
		})
	);
};
