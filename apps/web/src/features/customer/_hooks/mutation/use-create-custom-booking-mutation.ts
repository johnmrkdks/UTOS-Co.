import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateCustomBookingMutation = (options?: {
	onSuccess?: (data: any) => void;
	onError?: (error: any) => void;
}) => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.createCustomBooking.mutationOptions({
		onSuccess: (data) => {
			// Invalidate customer booking queries
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });
			
			// Call the custom success callback if provided
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			// Call the custom error callback if provided
			options?.onError?.(error);
		},
	}));
};