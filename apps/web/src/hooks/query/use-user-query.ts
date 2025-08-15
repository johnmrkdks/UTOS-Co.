import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useSignOutWithConfirmation } from "@/hooks/use-sign-out-with-confirmation";

export const useUserQuery = () => {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

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
