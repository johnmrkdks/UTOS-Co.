import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateDriverUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.admin.createDriverUser.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.drivers.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.admin.listUsers.queryKey() });
			toast.success("Driver account created successfully", {
				description: `Account created for ${data.user.email}. They can now access the driver onboarding process.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to create driver account", {
				description: error.message,
			});
		},
	}));
};