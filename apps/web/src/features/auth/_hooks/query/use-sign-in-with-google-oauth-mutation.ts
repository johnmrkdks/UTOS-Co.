import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export const useSignInWitGoogleOAuthMutation = () => {
	return useMutation({
		mutationFn: async (redirectPath?: string) => {
			const callbackURL = redirectPath
				? `${import.meta.env.VITE_CLIENT_URL}?redirect=${encodeURIComponent(redirectPath)}`
				: import.meta.env.VITE_CLIENT_URL;

			return await authClient.signIn.social({
				provider: "google",
				callbackURL,
			});
		},
		onSuccess: ({ data, error }) => {
			if (data && !data.redirect) {
				toast.success("Sign in successful");
			}

			if (error) {
				throw error;
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};
