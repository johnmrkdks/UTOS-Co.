import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface UseSignOutWithConfirmationProps {
	redirectTo?: string;
	onSignOutStart?: () => void;
	onSignOutSuccess?: () => void;
	onSignOutError?: (error: any) => void;
}

export const useSignOutWithConfirmation = ({
	redirectTo = "/",
	onSignOutStart,
	onSignOutSuccess,
	onSignOutError,
}: UseSignOutWithConfirmationProps = {}) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);

	const openSignOutDialog = () => {
		setIsDialogOpen(true);
	};

	const closeSignOutDialog = () => {
		setIsDialogOpen(false);
	};

	const confirmSignOut = async () => {
		setIsSigningOut(true);
		onSignOutStart?.();

		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						setIsDialogOpen(false);
						onSignOutSuccess?.();

						// Clear all query cache to prevent background refetches
						queryClient.clear();

						// Clear any persisted query data
						queryClient.getQueryCache().clear();
						queryClient.getMutationCache().clear();

						// Add a small delay to ensure session is cleared before navigation
						setTimeout(() => {
							navigate({ to: redirectTo });
						}, 100);

						toast.success("Signed out successfully", {
							description: "You have been securely signed out of your account.",
						});
					},
					onError: (error) => {
						onSignOutError?.(error);
						toast.error("Failed to sign out", {
							description: "There was an issue signing you out. Please try again.",
						});
					},
				},
			});
		} catch (error) {
			onSignOutError?.(error);
			toast.error("Failed to sign out", {
				description: "There was an issue signing you out. Please try again.",
			});
		} finally {
			setIsSigningOut(false);
		}
	};

	return {
		isDialogOpen,
		isSigningOut,
		openSignOutDialog,
		closeSignOutDialog,
		confirmSignOut,
	};
};