import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

export const useReorderPackageRoutesMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packageRoutes.reorder.mutationOptions({
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: trpc.packageRoutes.getByPackageId.queryKey({ packageId: variables.packageId }),
			});
			toast.success("Route order updated");
		},
		onError: (error) => {
			toast.error("Failed to reorder routes");
			console.error(error);
		},
	}));
};
