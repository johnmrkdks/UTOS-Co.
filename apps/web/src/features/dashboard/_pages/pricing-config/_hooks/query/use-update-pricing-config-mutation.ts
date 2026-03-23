import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useUpdatePricingConfigMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.pricingConfigs.update.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.pricingConfigs.list.queryKey(),
				});
				toast.success("Pricing configuration updated", {
					description: `"${data?.name || "Configuration"}" has been updated.`,
				});
			},
			onError: (error) => {
				toast.error("Failed to update pricing configuration", {
					description: error.message,
				});
			},
		}),
	);
};
