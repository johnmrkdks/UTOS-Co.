import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUnassignDriverMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.unassignDriver.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.listByType.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.get.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });

			toast.success("Driver unassigned successfully", {
				description: "Booking status reset to confirmed",
				duration: 2000,
			});
		},
		onError: (error) => {
			toast.error("Failed to unassign driver", {
				description: error.message,
				duration: 3000,
			});
		},
	}));
};