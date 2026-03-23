import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateContactMessageMutation = () => {
	return useMutation(trpc.contactMessages.create.mutationOptions({
		onSuccess: () => {
			toast.success("Message sent successfully", {
				description: "Thank you for contacting us. We'll get back to you soon.",
			});
		},
		onError: (error) => {
			toast.error("Failed to send message", {
				description: error.message,
			});
		},
	}));
};