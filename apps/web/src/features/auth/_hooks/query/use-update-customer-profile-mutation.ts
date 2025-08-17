import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateCustomerProfileMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.customerProfile.updateProfile.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.customerProfile.getProfile.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.customerProfile.getProfileCompleteness.queryKey() });
			toast.success("Profile updated successfully", {
				description: "Your customer profile has been updated.",
			});
		},
		onError: (error) => {
			toast.error("Failed to update profile", {
				description: error.message,
			});
		},
	}));
};