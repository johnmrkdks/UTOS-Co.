import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export interface SetPasswordInput {
	password: string;
}

export const useSetPasswordMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		(trpc as any).auth.setPassword.mutationOptions({
			onSuccess: () => {
				// Invalidate user and account queries to refresh account information
				queryClient.invalidateQueries({ queryKey: ["user"] });
				queryClient.invalidateQueries({
					queryKey: (trpc as any).auth.getUserAccounts.queryKey(),
				});

				toast.success("Password set successfully", {
					description: "You can now sign in with your email and password.",
				});
			},
			onError: (error: any) => {
				toast.error("Failed to set password", {
					description: error.message || "Please try again later.",
				});
			},
		}),
	);
};
