import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateDriverApplicationMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.drivers.createApplication.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.drivers.list.queryKey() });
			toast.success("Driver application submitted successfully", {
				description: `Your application has been submitted for review.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to submit driver application", {
				description: error.message,
			});
		},
	}));
};