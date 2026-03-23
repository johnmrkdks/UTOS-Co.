import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type SignUpParams = {
	name: string;
	email: string;
	password: string;
};

export const useSignUpMutation = () => {
	return useMutation({
		mutationFn: async (values: SignUpParams) => {
			return await authClient.signUp.email({
				name: values.name,
				email: values.email,
				password: values.password,
			});
		},
		onSuccess: ({ data, error }) => {
			if (data && data.user) {
				toast.success("Sign up successful");
			}

			if (error) {
				throw error;
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};
