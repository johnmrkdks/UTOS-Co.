import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function useCreatePackageRouteMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			packageId: string;
			stopOrder: number;
			locationName: string;
			address: string;
			latitude?: number;
			longitude?: number;
			estimatedDuration?: number;
			isPickupPoint?: boolean;
			isDropoffPoint?: boolean;
		}) => {
			return await trpc.packageRoutes.create.mutate(data);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ 
				queryKey: ["package-routes", variables.packageId] 
			});
			toast.success("Package route added successfully");
		},
		onError: (error) => {
			toast.error("Failed to add package route");
			console.error(error);
		},
	});
}