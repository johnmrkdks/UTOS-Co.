import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useCancelBookingMutation = (onSuccessCallback?: () => void) => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.bookings.cancelBooking.mutationOptions({
			onSuccess: (data) => {
				// Invalidate relevant queries
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.getUserBookings.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.getUnifiedUserBookings.queryKey(),
				});

				const feePart =
					data?.cancellationFeePercentage && data.cancellationFeePercentage > 0
						? ` (${data.cancellationFeePercentage}% cancellation fee applies)`
						: "";

				toast.success("Booking cancelled successfully" + feePart);

				// Execute the callback if provided
				if (onSuccessCallback) {
					onSuccessCallback();
				}
			},
			onError: (error) => {
				toast.error("Failed to cancel booking", {
					description: error.message,
				});
			},
		}),
	);
};
