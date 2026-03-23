import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useCancelBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.bookings.cancelBooking.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.listByType.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.get.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.getUserBookings.queryKey(),
				});

				toast.success(`Booking ${data?.id} cancelled successfully`);
			},
			onError: (error) => {
				toast.error("Error while cancelling booking", {
					description: error.message,
				});
			},
		}),
	);
};
