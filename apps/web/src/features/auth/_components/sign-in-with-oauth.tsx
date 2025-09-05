import { authClient } from "@/lib/auth-client";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Loader } from "@/components/loader";
import { useState } from "react";
import { companyIcons } from "@/features/auth/_utils/icons";
import { useSignInWitGoogleOAuthMutation } from "@/features/auth/_hooks/query/use-sign-in-with-google-oauth-mutation";
import { OAuthButton } from "./oauth-button";

export function SignInWithOAuth() {
	const navigate = useNavigate({
		from: "/",
	});
	const search = useSearch({ strict: false }) as any;
	const [isRedirecting, setIsRedirecting] = useState(false);
	const mutation = useSignInWitGoogleOAuthMutation();
	const { isPending } = authClient.useSession();

	if (isPending) {
		return <Loader />;
	}

	const signInWithGoogle = async () => {
		setIsRedirecting(true);

		const redirectPath = search.redirect;
		mutation.mutate(redirectPath, {
			onSuccess: ({ data }) => {
				if (data && data.redirect) {
					setIsRedirecting(true);
				}

				if (data && !data.redirect) {
					const finalRedirect = redirectPath || "/";
					navigate({
						to: finalRedirect,
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
