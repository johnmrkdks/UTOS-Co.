import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useAssignDriverMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.bookings.assignDriver.mutationOptions({
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
					queryKey: trpc.bookings.getDriverBookings.queryKey(),
				});

				toast.success("Driver assigned successfully");
			},
			onError: (error) => {
				toast.error("Error while assigning driver", {
					description: error.message,
				});
			},
		}),
	);
};
