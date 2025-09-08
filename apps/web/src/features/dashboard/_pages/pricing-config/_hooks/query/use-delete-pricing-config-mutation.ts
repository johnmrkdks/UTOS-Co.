import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeletePricingConfigMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.pricingConfigs.delete.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.pricingConfigs.list.queryKey() });
			
			toast.success(`Pricing configuration "${data?.name}" deleted`);
		},
		onError: (error) => {
			toast.error("Error while deleting pricing configuration", {
				description: error.message,
			});
		},
	}));
};