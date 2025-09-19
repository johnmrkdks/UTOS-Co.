import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export interface UpdateUserInput {
	name?: string;
	image?: string;
}

export const useUpdateUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: UpdateUserInput) => {
			console.log("🔄 Updating user profile with Better Auth");
			console.log("Update data:", JSON.stringify(input, null, 2));

			try {
				const result = await authClient.updateUser(input);

				console.log("📋 Better Auth updateUser result:", result);

				if (result.error) {
					console.error("❌ Better Auth error:", result.error);
					throw new Error(result.error.message || "Failed to update user profile");
				}

				console.log("✅ User profile updated successfully");
				return result.data;
			} catch (error) {
				console.error("❌ Exception during updateUser:", error);
				throw error;
			}
		},
		onSuccess: () => {
			// Invalidate user queries to refresh user information
			queryClient.invalidateQueries({ queryKey: ["user"] });

			toast.success("Profile updated successfully", {
				description: "Your profile information has been saved.",
			});
		},
		onError: (error: Error) => {
			console.error("❌ Failed to update user profile:", error);
			toast.error("Failed to update profile", {
				description: error.message || "Please try again later.",
			});
		},
	});
};