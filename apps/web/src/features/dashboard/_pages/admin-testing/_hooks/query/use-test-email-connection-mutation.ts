import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useTestEmailConnectionMutation = () => {
	return useMutation(
		trpc.mail.testEmailConnection.mutationOptions({
			onSuccess: (data) => {
				toast.success("Email connection test successful", {
					description: data.message,
				});
			},
			onError: (error) => {
				toast.error("Email connection test failed", {
					description: error.message,
				});
			},
		}),
	);
};
