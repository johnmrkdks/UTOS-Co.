import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useUnassignCarMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.bookings.unassignCar.mutationOptions({
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

				toast.success("Car unassigned successfully", {
					duration: 2000,
				});
			},
			onError: (error) => {
				toast.error("Failed to unassign car", {
					description: error.message,
					duration: 3000,
				});
			},
		}),
	);
};
