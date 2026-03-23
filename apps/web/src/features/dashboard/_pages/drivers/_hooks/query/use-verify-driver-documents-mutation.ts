import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useVerifyDriverDocumentsMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.drivers.verifyDocuments.mutationOptions({
			onSuccess: (data) => {
				// Invalidate drivers queries to refresh data
				queryClient.invalidateQueries({
					queryKey: trpc.drivers.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.drivers.listByStatus.queryKey(),
				});

				const statusMessage =
					data?.verificationStatus === "verified"
						? "Driver documents verified and approved"
						: data?.verificationStatus === "rejected"
							? "Driver verification rejected"
							: data?.verificationStatus === "needs_revision"
								? "Driver needs to revise documents"
								: "Driver verification status updated";

				toast.success("Document Verification Complete", {
					description: statusMessage,
				});
			},
			onError: (error) => {
				toast.error("Failed to verify driver documents", {
					description: error.message,
				});
			},
		}),
	);
};
