import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteDriverMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.drivers.delete.mutationOptions({
		onSuccess: () => {
			// Invalidate all related queries to refresh the UI
			queryClient.invalidateQueries({ queryKey: trpc.drivers.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.users.list.queryKey() });
			
			// Also invalidate any queries that might show user data with driver role
			queryClient.invalidateQueries({ predicate: (query) => {
				return query.queryKey.some(key => 
					typeof key === 'string' && (key.includes('drivers') || key.includes('users'))
				);
			}});
			
			toast.success("Driver deleted successfully", {
				description: "The driver account has been permanently removed.",
			});
		},
		onError: (error) => {
			toast.error("Failed to delete driver", {
				description: error.message,
			});
		},
	}));
};