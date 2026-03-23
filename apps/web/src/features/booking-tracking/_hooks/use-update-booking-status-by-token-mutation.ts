import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useUpdateBookingStatusByTokenMutation = (shareToken: string) => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.bookings.updateStatusByShareToken.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.getByShareToken.queryKey({ shareToken }),
				});
				toast.success("Status updated");
			},
			onError: (error) => {
				toast.error("Failed to update status", { description: error.message });
			},
		}),
	);
};
