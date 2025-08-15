import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useApproveDriverApplicationMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.drivers.approveApplication.mutationOptions({
		onSuccess: (data: any, variables: any) => {
			queryClient.invalidateQueries({ queryKey: trpc.drivers.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.drivers.listByStatus.queryKey() });
			
			const action = variables.approved ? "approved" : "rejected";
			toast.success(`Driver application ${action}`, {
				description: `The driver application has been ${action} successfully.`,
			});
		},
		onError: (error: any) => {
			toast.error("Failed to process driver application", {
				description: error.message,
			});
		},
	}));
};