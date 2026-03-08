import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAdminCreateCustomBookingMutation = (onSuccessCallback?: () => void) => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.adminCreateCustomBooking.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.listByType.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });

			toast.success(`Custom booking created successfully for ${data?.customerName}`);
			onSuccessCallback?.();
		},
		onError: (error) => {
			toast.error("Error while creating custom booking", {
				description: error.message,
			});
		},
	}));
};
