import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useSendInvoiceMutation = () => {
	return useMutation(
		trpc.mail.sendInvoice.mutationOptions({
			onSuccess: (data) => {
				toast.success("Invoice email sent successfully", {
					description: data.message,
				});
			},
			onError: (error) => {
				toast.error("Failed to send invoice email", {
					description: error.message,
				});
			},
		}),
	);
};
