import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreatePackageBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.createPackageBooking.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });
			const needsPayment = (data as { paymentStatus?: string })?.paymentStatus === "pending_payment";
			if (needsPayment) {
				toast.success("Booking submitted! Redirecting to payment...");
			} else {
				toast.success("Booking created successfully!", {
					description: "You will receive a confirmation email shortly.",
				});
			}
		},
		onError: (error) => {
			toast.error("Failed to create booking", {
				description: error.message || "Please try again later",
			});
		},
	}));
};