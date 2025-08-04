import { Button } from "@workspace/ui/components/button";
import { companyIcons } from "@/features/auth/_utils/icons";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Loader } from "@/components/loader";
import { useState } from "react";
import { useSignInWitGoogleOAuthMutation } from "@/features/auth/_hooks/query/use-sign-in-with-google-oauth-mutation";
import { OAuthButton } from "./oauth-button";

export function SignUpWithOAuth() {
	const navigate = useNavigate();
	const { isPending } = authClient.useSession();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const mutation = useSignInWitGoogleOAuthMutation();

	if (isPending) {
		return <Loader />;
	}

	const signInWithGoogle = async () => {
		setIsRedirecting(true);

		mutation.mutate(void 0, {
			onSuccess: ({ data }) => {
				if (data && data.redirect) {
					setIsRedirecting(true);
				}

				if (data && !data.redirect) {
					navigate({
						to: "/",
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
