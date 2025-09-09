import { authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRemoveUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userId: string) => {
			const { data, error } = await authClient.admin.removeUser({
				userId,
			});

			if (error) {
				throw new Error(error.message || "Failed to remove user");
			}

			return data;
		},
		onSuccess: () => {
			// Invalidate both drivers and users queries
			queryClient.invalidateQueries({ queryKey: ["drivers"] });
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User removed successfully", {
				description: "The user account has been permanently deleted using Better Auth.",
			});
		},
		onError: (error: Error) => {
			toast.error("Failed to remove user", {
				description: error.message,
			});
		},
	});
};