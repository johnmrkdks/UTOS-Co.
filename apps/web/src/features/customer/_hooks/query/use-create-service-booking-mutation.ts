import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateServiceBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.createPackageBooking.mutationOptions({
		onSuccess: (data) => {
			console.log("✅ Booking mutation successful:", data);
			// Invalidate user bookings to refresh the list
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });
			
			toast.success("Service booked successfully", {
				description: `Your booking for "${data?.id || 'booking'}" has been confirmed. We'll contact you shortly.`,
			});
		},
		onError: (error) => {
			console.error("❌ Booking mutation failed:", error);
			toast.error("Failed to book service", {
				description: error.message || "An unexpected error occurred. Please try again.",
			});
		},
		onMutate: (variables) => {
			console.log("🔄 Booking mutation starting with data:", variables);
		}
	}));
};