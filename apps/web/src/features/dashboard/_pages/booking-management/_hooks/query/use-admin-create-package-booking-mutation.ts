import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAdminCreatePackageBookingMutation = (onSuccessCallback?: () => void) => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.adminCreatePackageBooking.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.listByType.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });

			const paymentLinkSent = (data as { paymentLinkSent?: boolean })?.paymentLinkSent;
			const paymentLinkMessage = (data as { paymentLinkMessage?: string })?.paymentLinkMessage;
			if (paymentLinkSent) {
				toast.success(`Package booking created. Payment link sent to client.`);
			} else if (paymentLinkMessage) {
				toast.warning(`Package booking created, but payment link was not sent: ${paymentLinkMessage}`);
			} else {
				toast.success(`Package booking created successfully for ${data?.customerName}`);
			}
			onSuccessCallback?.();
		},
		onError: (error) => {
			toast.error("Error while creating package booking", {
				description: error.message,
			});
		},
	}));
};
