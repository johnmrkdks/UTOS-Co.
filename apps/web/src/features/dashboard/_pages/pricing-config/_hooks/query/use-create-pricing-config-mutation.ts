import { trpc } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreatePricingConfigMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: trpc.pricingConfig.create.mutate,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["pricing-configs"] });
			toast.success("Pricing configuration created", {
				description: `"${data.name}" has been added.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to create pricing configuration", {
				description: error.message,
			});
		},
	});
}