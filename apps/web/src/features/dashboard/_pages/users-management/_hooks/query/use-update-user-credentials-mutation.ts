import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateUserCredentialsMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.admin.updateUserCredentials.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.admin.listUsers.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.admin.getUser.queryKey() });
			toast.success("User updated successfully", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error("Failed to update user", {
				description: error.message,
			});
		},
	}));
};
