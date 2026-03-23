import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/trpc";

export interface LinkSocialAccountInput {
	provider: "google";
	callbackURL?: string;
}

export interface UnlinkAccountInput {
	providerId: string;
}

// Hook for linking social accounts (Google OAuth)
export const useLinkSocialAccountMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: LinkSocialAccountInput) => {
			console.log("🔗 Initiating Google account linking");

			// Use current page URL as callback - Better Auth will handle OAuth and redirect back here
			const currentUrl = window.location.href;
			const callbackURL = input.callbackURL || currentUrl;

			console.log("📍 Callback URL (current page):", callbackURL);

			const result = await authClient.linkSocial({
				provider: input.provider,
				callbackURL: callbackURL, // Pass current page URL
			});

			console.log("🚀 Link social result:", result);
			return result;
		},
		onSuccess: () => {
			// Note: Don't show success message here as the user will be redirected to Google
			// The success message will be shown when they return via the callback handler
			console.log("✅ Account linking mutation triggered successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to link account", {
				description: error.message || "Please try again later.",
			});
		},
	});
};

// Hook for unlinking accounts
export const useUnlinkAccountMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: UnlinkAccountInput) => {
			const result = await authClient.unlinkAccount({
				providerId: input.providerId,
			});

			if (result.error) {
				throw new Error(result.error.message || "Failed to unlink account");
			}

			return result;
		},
		onSuccess: () => {
			// Invalidate user and account queries to refresh account information
			queryClient.invalidateQueries({ queryKey: ["user"] });
			queryClient.invalidateQueries({
				queryKey: (trpc as any).auth.getUserAccounts.queryKey(),
			});

			toast.success("Account unlinked", {
				description: "The account has been successfully disconnected.",
			});
		},
		onError: (error: Error) => {
			toast.error("Failed to unlink account", {
				description: error.message || "Please try again later.",
			});
		},
	});
};
