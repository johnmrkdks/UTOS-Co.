import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useAdminCreateCustomBookingMutation = (
	onSuccessCallback?: () => void,
) => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.bookings.adminCreateCustomBooking.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.listByType.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.bookings.getUserBookings.queryKey(),
				});

				const paymentLinkSent = (data as { paymentLinkSent?: boolean })
					?.paymentLinkSent;
				const paymentLinkMessage = (data as { paymentLinkMessage?: string })
					?.paymentLinkMessage;
				if (paymentLinkSent) {
					toast.success("Booking created. Payment link sent to client.");
				} else if (paymentLinkMessage) {
					toast.warning(
						`Booking created, but payment link was not sent: ${paymentLinkMessage}`,
					);
				} else {
					toast.success(
						`Custom booking created successfully for ${data?.customerName}`,
					);
				}
				onSuccessCallback?.();
			},
			onError: (error) => {
				toast.error("Error while creating custom booking", {
					description: error.message,
				});
			},
		}),
	);
};
