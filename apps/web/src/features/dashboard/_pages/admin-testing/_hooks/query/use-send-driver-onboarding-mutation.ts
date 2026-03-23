import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useSendDriverOnboardingMutation = () => {
	return useMutation(
		trpc.mail.sendDriverOnboarding.mutationOptions({
			onSuccess: (data) => {
				toast.success("Driver onboarding email sent successfully", {
					description: data.message,
				});
			},
			onError: (error) => {
				toast.error("Failed to send driver onboarding email", {
					description: error.message,
				});
			},
		}),
	);
};
