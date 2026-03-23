import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export interface UpdatePhoneInput {
	phone?: string;
}

export const useUpdatePhoneMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		(trpc as any).auth.updateUserPhone.mutationOptions({
			onMutate: (variables: any) => {
				console.log("🔄 Starting phone update mutation with:", variables);
			},
			onSuccess: (data: any) => {
				console.log("✅ Phone update successful:", data);
				// Invalidate user queries to refresh user information
				queryClient.invalidateQueries({ queryKey: ["user"] });

				toast.success("Phone number updated", {
					description: "Your phone number has been updated successfully.",
				});
			},
			onError: (error: any) => {
				console.error("❌ Phone update failed:", error);
				toast.error("Failed to update phone number", {
					description: error.message || "Please try again later.",
				});
			},
		}),
	);
};
