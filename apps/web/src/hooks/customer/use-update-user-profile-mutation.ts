import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useUpdateUserProfileMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.customerProfile.updateUserProfile.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({ queryKey: ["user"] }); // Invalidate user session
				queryClient.invalidateQueries({
					queryKey: trpc.customerProfile.getProfile.queryKey(),
				});
				toast.success("Profile updated successfully", {
					description: "Your profile information has been updated.",
				});
			},
			onError: (error) => {
				toast.error("Failed to update profile", {
					description: error.message,
				});
			},
		}),
	);
};
