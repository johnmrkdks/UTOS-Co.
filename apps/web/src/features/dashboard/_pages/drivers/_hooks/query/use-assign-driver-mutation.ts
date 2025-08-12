import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAssignDriverMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.drivers.assignToBooking.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.drivers.list.queryKey() });
			toast.success("Driver assigned successfully", {
				description: `Driver has been assigned to the booking.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to assign driver", {
				description: error.message,
			});
		},
	}));
};
