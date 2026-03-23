import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useSendDriverAssignmentNotificationMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.mail.sendDriverAssignmentNotification.mutationOptions({
			onSuccess: (data) => {
				toast.success("Driver Assignment Notification", {
					description: data.message,
				});
			},
			onError: (error) => {
				toast.error("Failed to Send Driver Notification", {
					description: error.message,
				});
			},
		}),
	);
};
