import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useSendDriverOnboardingEmailMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.drivers.sendOnboardingEmail.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.drivers.listByStatus.queryKey(),
				});
				toast.success("Onboarding email sent successfully", {
					description: `Driver onboarding instructions sent to ${data.email}`,
				});
			},
			onError: (error) => {
				toast.error("Failed to send onboarding email", {
					description: error.message,
				});
			},
		}),
	);
};
