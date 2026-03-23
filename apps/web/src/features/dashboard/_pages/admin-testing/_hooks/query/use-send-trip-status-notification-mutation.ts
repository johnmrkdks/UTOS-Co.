import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSendTripStatusNotificationMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.mail.sendTripStatusNotification.mutationOptions({
		onSuccess: (data) => {
			toast.success("Trip Status Notification", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error("Failed to Send Trip Status Notification", {
				description: error.message,
			});
		},
	}));
};