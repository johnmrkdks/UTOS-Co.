import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useArchiveBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.archive.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			toast.success(data?.message || "Booking archive status updated", {
				description: "The booking has been updated successfully.",
			});
		},
		onError: (error) => {
			toast.error("Failed to update booking archive status", {
				description: error.message || "Please try again later.",
			});
		},
	}));
};