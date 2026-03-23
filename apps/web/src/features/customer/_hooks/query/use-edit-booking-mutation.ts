import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useEditBookingMutation = (onSuccessCallback?: () => void) => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.editBooking.mutationOptions({
		onMutate: (data) => {
			console.log("🔄 Edit booking mutation starting with data:", data);
		},
		onSuccess: (data) => {
			console.log("✅ Edit booking mutation successful:", data);

			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUnifiedUserBookings.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });

			toast.success("Booking updated successfully");

			// Execute the callback if provided
			if (onSuccessCallback) {
				onSuccessCallback();
			}
		},
		onError: (error) => {
			console.error("❌ Edit booking mutation failed:", error);
			toast.error("Failed to update booking", {
				description: error.message,
			});
		},
	}));
};