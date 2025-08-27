import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useTogglePricingConfigActiveMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.pricingConfigs.toggleActive.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.pricingConfigs.list.queryKey() });
			toast.success("Pricing configuration updated", {
				description: `"${data?.name || 'Configuration'}" is now ${data?.isActive ? 'active' : 'inactive'}.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to update pricing configuration", {
				description: error.message,
			});
		},
	}));
};