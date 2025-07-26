import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner";

export const useSignInWitGoogleOAuthMutation = () => {
	return useMutation({
		mutationFn: async () => {
			return await authClient.signIn.social(
				{
					provider: "google",
					callbackURL: import.meta.env.VITE_CLIENT_URL,
				}
			);
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
	})
}
