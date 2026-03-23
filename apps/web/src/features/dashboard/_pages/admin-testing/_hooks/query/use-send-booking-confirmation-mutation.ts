import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useSendBookingConfirmationMutation = () => {
	return useMutation(
		trpc.mail.sendBookingConfirmation.mutationOptions({
			onSuccess: (data) => {
				toast.success("Booking confirmation email sent successfully", {
					description: data.message,
				});
			},
			onError: (error) => {
				toast.error("Failed to send booking confirmation email", {
					description: error.message,
				});
			},
		}),
	);
};
