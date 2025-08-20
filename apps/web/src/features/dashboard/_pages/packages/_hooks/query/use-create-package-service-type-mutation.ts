import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

export const useCreatePackageServiceTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packageServiceTypes.create.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.packageServiceTypes.list.queryKey() });
			toast.success("Service type created successfully");
		},
		onError: (error) => {
			toast.error("Failed to create service type");
			console.error(error);
		},
	}));
};