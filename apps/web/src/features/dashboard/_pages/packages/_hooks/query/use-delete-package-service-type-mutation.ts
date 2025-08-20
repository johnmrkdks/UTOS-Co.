import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

export const useDeletePackageServiceTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packageServiceTypes.delete.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.packageServiceTypes.list.queryKey() });
			toast.success("Service type deleted successfully");
		},
		onError: (error) => {
			toast.error("Failed to delete service type");
			console.error(error);
		},
	}));
};