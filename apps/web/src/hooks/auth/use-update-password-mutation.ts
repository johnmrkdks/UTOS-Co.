import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export interface UpdatePasswordInput {
	currentPassword: string;
	newPassword: string;
	revokeOtherSessions?: boolean;
}

export const useUpdatePasswordMutation = () => {
	return useMutation({
		mutationFn: async (input: UpdatePasswordInput) => {
			const { data, error } = await authClient.changePassword({
				newPassword: input.newPassword,
				currentPassword: input.currentPassword,
				revokeOtherSessions: input.revokeOtherSessions ?? true, // Default to true for security
			});

			if (error) {
				throw new Error(error.message || "Failed to update password");
			}

			return data;
		},
		onSuccess: () => {
			toast.success("Password updated successfully", {
				description: "Your password has been changed. Other sessions have been revoked for security.",
			});
		},
		onError: (error: Error) => {
			toast.error("Failed to update password", {
				description: error.message,
			});
		},
	});
};