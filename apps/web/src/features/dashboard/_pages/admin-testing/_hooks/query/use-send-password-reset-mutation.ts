import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useSendPasswordResetMutation = () => {
	return useMutation(
		trpc.mail.sendPasswordReset.mutationOptions({
			onSuccess: (data) => {
				toast.success("Password reset email sent successfully", {
					description: data.message,
				});
			},
			onError: (error) => {
				toast.error("Failed to send password reset email", {
					description: error.message,
				});
			},
		}),
	);
};
