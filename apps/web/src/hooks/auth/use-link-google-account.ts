import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useLinkGoogleAccount() {
	return useMutation({
		mutationFn: async () => {
			await authClient.linkSocial({
				provider: "google",
				callbackURL: "/driver/settings?linked=true",
			});
		},
		onSuccess: () => {
			toast.success("Redirecting to Google", {
				description: "You'll be redirected to link your Google account.",
			});
		},
		onError: (error: any) => {
			toast.error("Failed to link Google account", {
				description: error.message || "Please try again.",
			});
		},
	});
}