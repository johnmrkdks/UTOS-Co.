import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateBookingStatusMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.updateStatus.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.listByType.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.get.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });

			toast.success(`Booking status updated to ${data?.status?.replace("_", " ")}`);
		},
		onError: (error) => {
			toast.error("Error while updating booking status", {
				description: error.message,
			});
		},
	}));
};