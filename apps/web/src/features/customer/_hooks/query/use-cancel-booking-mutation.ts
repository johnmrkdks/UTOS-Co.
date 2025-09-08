import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCancelBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.cancelBooking.mutationOptions({
		onSuccess: (data) => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });
			
			const feePart = data?.cancellationFeePercentage && data.cancellationFeePercentage > 0 
				? ` (${data.cancellationFeePercentage}% cancellation fee applies)`
				: '';
			
			toast.success("Booking cancelled successfully" + feePart);
		},
		onError: (error) => {
			toast.error("Failed to cancel booking", {
				description: error.message,
			});
		},
	}));
};