import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader } from "@/components/loader";
import { useState } from "react";
import { companyIcons } from "@/features/auth/_utils/icons";

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL;

export function SignInWithOAuth() {
	const navigate = useNavigate();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const { isPending } = authClient.useSession();

	if (isPending) {
		return <Loader />;
	}

	const signInWithGoogle = async () => {
		console.log("Client URL", CLIENT_URL);
		const { data, error } = await authClient.signIn.social(
			{
				provider: "google",
				callbackURL: import.meta.env.VITE_CLIENT_URL,
			}
		);

		if (data && data.redirect) {
			setIsRedirecting(true);
		}

		if (data && !data.redirect) {
			navigate({
				to: "/",
			});
			toast.success("Sign in successful");
		}

		if (error) {
			toast.error(error.message);
		}
	};

	return (
		<div>
			<Button
				variant="outline"
				className="px-2.5 py-3.5"
				onClick={signInWithGoogle}
				disabled={isRedirecting}
			>
				<img src={companyIcons.google} alt="Google" className="h-4 w-4" />
			</Button>
		</div>
	);
}
