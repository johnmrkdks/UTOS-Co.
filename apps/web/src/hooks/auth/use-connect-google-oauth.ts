import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface ConnectGoogleOAuthInput {
	callbackURL?: string;
}

export const useConnectGoogleOAuthMutation = () => {
	return useMutation({
		mutationFn: async (input: ConnectGoogleOAuthInput = {}) => {
			// This connects/links Google OAuth to existing account
			await authClient.signIn.social({
				provider: "google",
				callbackURL: input.callbackURL || "/driver/settings?connected=true",
			});
		},
		onSuccess: () => {
			toast.success("Google account connected", {
				description: "You can now sign in with your Google account.",
			});
		},
		onError: (error: any) => {
			toast.error("Failed to connect Google account", {
				description: error.message || "Please try again.",
			});
		},
	});
};
