import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";

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

	return { session, isPending, handleLogout };
}
