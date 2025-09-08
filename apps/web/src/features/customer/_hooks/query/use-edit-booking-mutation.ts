import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useEditBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.editBooking.mutationOptions({
		onSuccess: (data) => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUnifiedUserBookings.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });
			
			toast.success("Booking updated successfully");
		},
		onError: (error) => {
			toast.error("Failed to update booking", {
				description: error.message,
			});
		},
	}));
};