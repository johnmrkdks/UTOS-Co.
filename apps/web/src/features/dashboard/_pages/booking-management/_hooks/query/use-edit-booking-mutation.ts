import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useEditBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.bookings.update.mutationOptions({
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

				toast.success(`Booking ${data?.id} updated successfully`);
			},
			onError: (error) => {
				toast.error("Error while updating booking", {
					description: error.message,
				});
			},
		}),
	);
};
