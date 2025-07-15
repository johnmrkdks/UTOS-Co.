import { Button } from "@/components/ui/button";
import { companyIcons } from "../utils/icon";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import Loader from "@/components/loader";

export function SignInWithOAuth() {
	const navigate = useNavigate();
	const { isPending } = authClient.useSession();

	if (isPending) {
		return <Loader />;
	}

	const signInWithGoogle = async () => {
		await authClient.signIn.social(
			{
				provider: "google",
			},
			{
				onSuccess: (data) => {
					console.log(data);

					navigate({
						to: "/dashboard",
					});
					toast.success("Sign in successful");
				},
				onError: (error) => {
					toast.error(error.error.message);
				},
			},
		);
	};

	return (
		<div>
			<Button
				variant="outline"
				className="px-2.5 py-3.5"
				onClick={signInWithGoogle}
			>
				<img src={companyIcons.google} alt="Google" className="h-4 w-4" />
			</Button>
		</div>
	);
}
