import { useUserQuery } from "@/hooks/query/use-user-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

interface UseEmailVerificationGuardOptions {
	/** Whether to redirect to verification page if email is not verified */
	redirectOnUnverified?: boolean;
	/** Custom message to show when email is not verified */
	customMessage?: string;
	/** Whether to show a toast notification */
	showToast?: boolean;
}

export function useEmailVerificationGuard(options: UseEmailVerificationGuardOptions = {}) {
	const { session } = useUserQuery();
	const navigate = useNavigate();
	
	const {
		redirectOnUnverified = false,
		customMessage = "Please verify your email address to continue",
		showToast = true,
	} = options;

	const user = session?.user;
	const isEmailVerified = user?.emailVerified || false;
	const hasEmail = !!user?.email;

	useEffect(() => {
		if (user && !isEmailVerified && redirectOnUnverified) {
			if (showToast) {
				toast.warning("Email verification required", {
					description: customMessage,
				});
			}
			navigate({ to: "/driver/verify-email" });
		}
	}, [user, isEmailVerified, redirectOnUnverified, customMessage, showToast, navigate]);

	const requireEmailVerification = (action: string = "perform this action") => {
		if (!isEmailVerified) {
			toast.warning("Email verification required", {
				description: `Please verify your email address to ${action}`,
				action: {
					label: "Verify Email",
					onClick: () => navigate({ to: "/driver/verify-email" }),
				},
			});
			return false;
		}
		return true;
	};

	const showVerificationPrompt = (message?: string) => {
		toast.info("Verify your email for full access", {
			description: message || "Verify your email to unlock all driver features",
			action: {
				label: "Verify Now",
				onClick: () => navigate({ to: "/driver/verify-email" }),
			},
		});
	};

	return {
		isEmailVerified,
		hasEmail,
		user,
		requireEmailVerification,
		showVerificationPrompt,
		canAccessFeature: (featureName?: string) => {
			if (!isEmailVerified) {
				const message = featureName 
					? `Please verify your email to access ${featureName}`
					: "Please verify your email to access this feature";
				
				if (showToast) {
					toast.warning("Email verification required", {
						description: message,
						action: {
							label: "Verify Email",
							onClick: () => navigate({ to: "/driver/verify-email" }),
						},
					});
				}
				return false;
			}
			return true;
		},
	};
}