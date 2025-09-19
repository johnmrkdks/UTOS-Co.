import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Interface matching the backend service structure
export interface ExtrasFormData {
	additionalWaitTime: number;
	unscheduledStops: number;
	parkingCharges: number; // in dollars with decimal precision
	tollCharges: number; // in dollars with decimal precision
	location: string;
	otherCharges: {
		description: string;
		amount: number; // in dollars with decimal precision
	};
	extraType: 'general' | 'driver' | 'operator';
	notes: string;
}

export const useCloseTripWithExtrasMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.closeTripWithExtras.mutationOptions({
		onSuccess: (data) => {
			// Invalidate and refetch related queries to ensure UI updates
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });

			// Force refetch driver bookings to update the trip list
			queryClient.refetchQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });

			toast.success("Trip completed with extras", {
				description: `Total fare updated: $${data?.data?.booking?.finalAmount ? data.data.booking.finalAmount.toFixed(2) : '0.00'}`,
			});
		},
		onError: (error) => {
			console.error("Error closing trip with extras:", error);
			toast.error("Failed to complete trip", {
				description: error.message || "An error occurred while completing the trip",
			});
		},
	}));
};

export const useCloseTripWithoutExtrasMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.closeTripWithoutExtras.mutationOptions({
		onSuccess: (data) => {
			// Invalidate and refetch related queries to ensure UI updates
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });

			// Force refetch driver bookings to update the trip list
			queryClient.refetchQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });

			toast.success("Trip completed successfully", {
				description: "The trip has been marked as completed",
			});
		},
		onError: (error) => {
			console.error("Error closing trip:", error);
			toast.error("Failed to complete trip", {
				description: error.message || "An error occurred while completing the trip",
			});
		},
	}));
};