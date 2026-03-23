import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Loader } from "@/components/loader";
import { useSignInWitGoogleOAuthMutation } from "@/features/auth/_hooks/query/use-sign-in-with-google-oauth-mutation";
import { companyIcons } from "@/features/auth/_utils/icons";
import { authClient } from "@/lib/auth-client";
import { handlePostLoginRedirect } from "@/utils/auth";
import { OAuthButton } from "./oauth-button";

export function SignInWithOAuth() {
	const navigate = useNavigate({
		from: "/",
	});
	const search = useSearch({ strict: false }) as any;
	const [isRedirecting, setIsRedirecting] = useState(false);
	const mutation = useSignInWitGoogleOAuthMutation();
	const { isPending } = authClient.useSession();
	const queryClient = useQueryClient();

	if (isPending) {
		return <Loader />;
	}

	const signInWithGoogle = async () => {
		setIsRedirecting(true);

		const redirectPath = search.redirect;
		mutation.mutate(redirectPath, {
			onSuccess: async ({ data }) => {
				if (data && data.redirect) {
					setIsRedirecting(true);
					// OAuth provider will handle the redirect
					return;
				}

				if (data && !data.redirect) {
					// Use unified post-login redirect handler
					await handlePostLoginRedirect({
						queryClient,
						navigate,
						redirectPath,
					});
				}
			},
		});
	};

	return (
		<div>
			<OAuthButton
				provider="Google"
				icon={companyIcons.google || "/placeholder.svg?height=16&width=16"}
				onClick={signInWithGoogle}
				isLoading={isRedirecting}
			/>
		</div>
	);
}
