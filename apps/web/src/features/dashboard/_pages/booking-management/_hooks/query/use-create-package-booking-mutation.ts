import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreatePackageBookingMutation = (onSuccessCallback?: () => void) => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.createPackageBooking.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.listByType.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });

			toast.success(`Package booking created successfully for ${data?.customerName}`);
			onSuccessCallback?.();
		},
		onError: (error) => {
			toast.error("Error while creating package booking", {
				description: error.message,
			});
		},
	}));
};