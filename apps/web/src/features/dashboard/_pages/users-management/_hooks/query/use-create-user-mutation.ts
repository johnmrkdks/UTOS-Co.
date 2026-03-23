import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useCreateUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.admin.createUser.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.admin.listUsers.queryKey(),
				});
				toast.success("User created successfully", {
					description: data.message,
				});
			},
			onError: (error) => {
				toast.error("Failed to create user", {
					description: error.message,
				});
			},
		}),
	);
};
