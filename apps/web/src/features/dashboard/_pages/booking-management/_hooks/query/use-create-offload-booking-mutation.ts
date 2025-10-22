import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { OffloadBookingFormData } from "../../_schemas/offload-booking-schema";

export const useCreateOffloadBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.createOffloadBooking.mutationOptions({
		onSuccess: (data) => {
			// Invalidate bookings queries to refresh the list
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });

			toast.success("Offload booking created successfully");
		},
		onError: (error) => {
			console.error("Error creating offload booking:", error);
			toast.error("Failed to create offload booking", {
				description: error.message || "An error occurred while creating the booking.",
			});
		},
	}));
};