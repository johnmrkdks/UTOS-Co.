import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type SignInParams = {
	email: string;
	password: string;
};

export const useSignInMutation = () => {
	return useMutation({
		mutationFn: async (values: SignInParams) => {
			return await authClient.signIn.email({
				email: values.email,
				password: values.password,
			});
		},
		onSuccess: ({ data, error }) => {
			if (data && !data.redirect) {
				toast.success("Sign in successful");
			}

			if (error) {
				throw error;
			}
		},
		onError: (error) => {
			console.log("error", error);
			toast.error(error.message);
		},
	});
};
