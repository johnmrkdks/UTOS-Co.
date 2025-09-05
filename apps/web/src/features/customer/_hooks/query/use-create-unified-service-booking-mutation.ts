import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Unified service booking mutation that works for both authenticated and guest users
 */
export const useCreateUnifiedServiceBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.createPackageBooking.mutationOptions({
		onSuccess: (data) => {
			console.log("✅ Unified booking mutation successful:", data);
			
			// Invalidate relevant queries - handle both authenticated and guest scenarios
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });
			
			toast.success("Service booked successfully", {
				description: `Your booking has been confirmed. We'll contact you shortly.`,
			});
		},
		onError: (error) => {
			console.error("❌ Unified booking mutation failed:", error);
			toast.error("Failed to book service", {
				description: error.message || "An unexpected error occurred. Please try again.",
			});
		},
		onMutate: (variables) => {
			console.log("🔄 Unified booking mutation starting with data:", variables);
		}
	}));
};