import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkArchiveBookingsMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.bulkArchive.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			toast.success(data?.message || "Bookings archived successfully", {
				description: `${data?.updatedCount || 0} booking(s) have been updated.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to archive bookings", {
				description: error.message || "Please try again later.",
			});
		},
	}));
};

export const useBulkDeleteBookingsMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.bulkDelete.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			toast.success(data?.message || "Bookings deleted successfully", {
				description: `${data?.deletedCount || 0} booking(s) have been permanently deleted.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to delete bookings", {
				description: error.message || "Please try again later.",
			});
		},
	}));
};