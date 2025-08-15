import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSendAccountVerificationMutation = () => {
	return useMutation(trpc.mail.sendAccountVerification.mutationOptions({
		onSuccess: (data) => {
			toast.success("Account verification email sent successfully", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error("Failed to send verification email", {
				description: error.message,
			});
		},
	}));
};