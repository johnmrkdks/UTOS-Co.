import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

export const useUpdatePackageServiceTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packageServiceTypes.update.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.packageServiceTypes.list.queryKey() });
			toast.success("Service type updated successfully");
		},
		onError: (error) => {
			toast.error("Failed to update service type");
			console.error(error);
		},
	}));
};