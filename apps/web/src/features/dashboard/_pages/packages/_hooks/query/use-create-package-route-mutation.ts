import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

export const useCreatePackageRouteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packageRoutes.create.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.packageRoutes.getByPackageId.queryKey()
			});
			toast.success("Package route added successfully");
		},
		onError: (error) => {
			toast.error("Failed to add package route");
			console.error(error);
		},
	}));
};
