import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface SendVerificationEmailInput {
	email: string;
	callbackURL?: string;
}

export const useSendVerificationEmailMutation = () => {
	return useMutation({
		mutationFn: async (input: SendVerificationEmailInput) => {
			const result = await authClient.sendVerificationEmail({
				email: input.email,
				callbackURL: input.callbackURL || "/driver?verified=true",
			});
			return result;
		},
		onSuccess: (_, variables) => {
			toast.success("Verification email sent!", {
				description: `Please check your email at ${variables.email} for the verification link.`,
			});
		},
		onError: (error: any) => {
			toast.error("Failed to send verification email", {
				description: error.message || "Please try again.",
			});
		},
	});
};
