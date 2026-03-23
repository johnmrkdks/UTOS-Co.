import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

export const useDeletePackageRouteMutation = (packageId: string) => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packageRoutes.delete.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.packageRoutes.getByPackageId.queryKey({ packageId }),
			});
			toast.success("Route stop removed");
		},
		onError: (error) => {
			toast.error("Failed to delete route stop");
			console.error(error);
		},
	}));
};
