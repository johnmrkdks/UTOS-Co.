import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

export interface UpdateProfileInput {
	name?: string;
	phone?: string;
}

export const useUpdateProfileMutation = () => {
	const queryClient = useQueryClient();

	return useMutation((trpc as any).auth.updateUserProfile.mutationOptions({
		onMutate: (variables: any) => {
			console.log("🔄 Starting profile update mutation with:", variables);
		},
		onSuccess: (data: any) => {
			console.log("✅ Profile update successful:", data);

			// Invalidate user queries to refresh user information
			queryClient.invalidateQueries({ queryKey: ["user"] });

			toast.success("Profile updated successfully", {
				description: "Your profile information has been saved.",
			});
		},
		onError: (error: any) => {
			console.error("❌ Profile update failed:", error);
			toast.error("Failed to update profile", {
				description: error.message || "Please try again later.",
			});
		},
	}));
};