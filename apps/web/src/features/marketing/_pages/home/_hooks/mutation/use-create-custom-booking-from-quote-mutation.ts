import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateCustomBookingFromQuoteMutation() {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.createCustomBookingFromQuote.mutationOptions({
		onSuccess: (data: any) => {
			// Invalidate user booking queries
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });
			
			toast.success("Booking created successfully!", {
				description: `Your luxury chauffeur service has been booked. Booking ID: ${data.id}`,
			});
		},
		onError: (error: any) => {
			toast.error("Failed to create booking", {
				description: error.message || "Please try again or contact support if the problem persists.",
			});
		},
	}));
}