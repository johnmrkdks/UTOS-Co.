import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useSignOutWithConfirmation } from "@/hooks/use-sign-out-with-confirmation";
import { useSession } from "@/providers/session-provider";

export const useUserQuery = () => {
	const navigate = useNavigate();
	// Use the cached session from SessionProvider instead of authClient.useSession()
	const { session, isPending } = useSession();

	function handleLogout() {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({
						to: "/",
					});
				},
			},
		});
	}

	// New hook with confirmation dialog support
	const signOutWithConfirmation = useSignOutWithConfirmation();

	return {
		session,
		isPending,
		handleLogout,
		signOutWithConfirmation
	};
}
