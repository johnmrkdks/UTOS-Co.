import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface ChangePasswordInput {
	currentPassword: string;
	newPassword: string;
}

export const useChangePasswordMutation = () => {
	return useMutation({
		mutationFn: async (input: ChangePasswordInput) => {
			const result = await authClient.changePassword({
				currentPassword: input.currentPassword,
				newPassword: input.newPassword,
			});
			return result;
		},
		onSuccess: () => {
			toast.success("Password changed successfully", {
				description: "Your password has been updated.",
			});
		},
		onError: (error: any) => {
			toast.error("Failed to change password", {
				description:
					error.message || "Please check your current password and try again.",
			});
		},
	});
};
