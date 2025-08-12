import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdatePricingConfigMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.pricingConfig.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.pricingConfig.list.queryKey() });
			toast.success("Pricing configuration updated", {
				description: `"${data.name}" has been updated.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to update pricing configuration", {
				description: error.message,
			});
		},
	}));
};
