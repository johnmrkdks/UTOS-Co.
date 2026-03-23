import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useCreatePricingConfigMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.pricingConfigs.create.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.pricingConfigs.list.queryKey(),
				});
				toast.success("Pricing configuration created", {
					description: `"${data?.name || "Configuration"}" has been added.`,
				});
			},
			onError: (error) => {
				toast.error("Failed to create pricing configuration", {
					description: error.message,
				});
			},
		}),
	);
};
