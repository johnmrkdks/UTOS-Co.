import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner";

type SignUpParams = {
	name: string;
	email: string;
	password: string;
};

export const useSignUpMutation = () => {
	return useMutation({
		mutationFn: async (values: SignUpParams) => {
			return await authClient.signUp.email(
				{
					name: values.name,
					email: values.email,
					password: values.password,
				},
			);
		},
		onSuccess: () => {
			toast.success("Sign up successful");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	})
}
