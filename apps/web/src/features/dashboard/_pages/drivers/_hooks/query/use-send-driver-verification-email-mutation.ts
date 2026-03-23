import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useSendDriverVerificationEmailMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.drivers.sendVerificationEmail.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.drivers.listByStatus.queryKey(),
				});
				toast.success("Verification email sent successfully", {
					description: `Email verification sent to ${data.email}`,
				});
			},
			onError: (error) => {
				toast.error("Failed to send verification email", {
					description: error.message,
				});
			},
		}),
	);
};
