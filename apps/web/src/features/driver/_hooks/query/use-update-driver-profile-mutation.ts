import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useUpdateDriverProfileMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.drivers.updateProfile.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.drivers.current.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.drivers.list.queryKey(),
				});
				queryClient.invalidateQueries({ queryKey: ["user"] }); // Also invalidate user session
				toast.success("Profile updated successfully", {
					description: "Your driver profile has been updated.",
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
