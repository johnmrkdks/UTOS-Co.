import { trpc } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAssignDriverMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: trpc.drivers.assignToBooking.mutate,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			queryClient.invalidateQueries({ queryKey: ["drivers"] });
			toast.success("Driver assigned successfully", {
				description: `Driver has been assigned to the booking.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to assign driver", {
				description: error.message,
			});
		},
	});
}