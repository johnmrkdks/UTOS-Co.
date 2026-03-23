import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.admin.deleteUser.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.admin.listUsers.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.drivers.list.queryKey() });
			toast.success("User deleted successfully", {
				description: "The user account has been permanently removed.",
			});
		},
		onError: (error) => {
			toast.error("Failed to delete user", {
				description: error.message,
			});
		},
	}));
};
