import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

export interface UpdateProfileInput {
	name?: string;
	phone?: string;
}

export const useUpdateProfileMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.auth.updateUserProfile.mutationOptions({
		onMutate: (variables) => {
			console.log("🔄 Starting profile update mutation with:", variables);
		},
		onSuccess: (data) => {
			console.log("✅ Profile update successful:", data);

			// Invalidate user queries to refresh user information
			queryClient.invalidateQueries({ queryKey: ["user"] });

			toast.success("Profile updated successfully", {
				description: "Your profile information has been saved.",
			});
		},
		onError: (error) => {
			console.error("❌ Profile update failed:", error);
			toast.error("Failed to update profile", {
				description: error.message || "Please try again later.",
			});
		},
	}));
};