import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

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
						navigate({ to: redirectTo });
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