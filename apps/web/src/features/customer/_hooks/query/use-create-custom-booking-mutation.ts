import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCustomBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.createCustomBooking.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });
			
			toast.success("Car booking created successfully!", {
				description: "You will receive a confirmation email shortly.",
			});
		},
		onError: (error) => {
			toast.error("Failed to create booking", {
				description: error.message || "Please try again later",
			});
		},
	}));
};