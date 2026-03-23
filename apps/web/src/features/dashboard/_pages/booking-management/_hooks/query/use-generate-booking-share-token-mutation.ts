import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useGenerateBookingShareTokenMutation = (
	bookingId: string | undefined,
) => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.bookings.generateShareToken.mutationOptions({
			onSuccess: (_data, variables) => {
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.get.queryKey({ id: variables.bookingId }),
				});
				toast.success("Share link generated");
			},
			onError: (error) => {
				toast.error("Failed to generate share link", {
					description: error.message,
				});
			},
		}),
	);
};
