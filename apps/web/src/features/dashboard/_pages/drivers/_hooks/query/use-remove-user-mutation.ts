import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRemoveUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.drivers.delete.mutationOptions({
		onSuccess: (data) => {
			// Invalidate all related queries to refresh the UI
			queryClient.invalidateQueries({ queryKey: trpc.drivers.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.users.list.queryKey() });
			
			// Also invalidate any queries that might show user data with driver role
			queryClient.invalidateQueries({ predicate: (query) => {
				return query.queryKey.some(key => 
					typeof key === 'string' && (key.includes('drivers') || key.includes('users'))
				);
			}});
			
			toast.success("User account removed successfully", {
				description: `Deleted driver${data?.deletedDriverId ? ` and driver record` : ''}, removed user account${data?.deletedUserId ? ` ${data.deletedUserId}` : ''}.`,
			});
		},
		onError: (error) => {
			// Check if it's a structured error with booking details
			try {
				const errorData = JSON.parse(error.message);
				if (errorData.type === 'DRIVER_HAS_ACTIVE_BOOKINGS') {
					toast.error("Cannot delete driver with active bookings", {
						description: `Driver has ${errorData.details.upcomingBookings} upcoming and ${errorData.details.inProgressBookings} in-progress bookings.`,
					});
				} else if (errorData.type === 'CONFIRMATION_REQUIRED') {
					toast.error("Confirmation required", {
						description: "Use the comprehensive deletion dialog for proper confirmation and validation.",
					});
				} else {
					toast.error("Failed to remove user account", {
						description: error.message,
					});
				}
			} catch {
				toast.error("Failed to remove user account", {
					description: error.message,
				});
			}
		},
	}));
};