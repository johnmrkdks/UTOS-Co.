import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

export interface UpdatePhoneInput {
	phone?: string;
}

export const useUpdatePhoneMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.auth.updateUserPhone.mutationOptions({
		onMutate: (variables) => {
			console.log("🔄 Starting phone update mutation with:", variables);
		},
		onSuccess: (data) => {
			console.log("✅ Phone update successful:", data);
			// Invalidate user queries to refresh user information
			queryClient.invalidateQueries({ queryKey: ["user"] });

			toast.success("Phone number updated", {
				description: "Your phone number has been updated successfully.",
			});
		},
		onError: (error) => {
			console.error("❌ Phone update failed:", error);
			toast.error("Failed to update phone number", {
				description: error.message || "Please try again later.",
			});
		},
	}));
};