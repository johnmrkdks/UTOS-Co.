import { trpc } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdatePricingConfigMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: trpc.pricingConfig.update.mutate,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["pricing-configs"] });
			toast.success("Pricing configuration updated", {
				description: `"${data.name}" has been updated.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to update pricing configuration", {
				description: error.message,
			});
		},
	});
}