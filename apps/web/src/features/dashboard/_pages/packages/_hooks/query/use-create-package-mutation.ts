import { trpc } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreatePackageMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: trpc.packages.create.mutate,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["packages"] });
			toast.success("Package created successfully", {
				description: `"${data.name}" has been added to your packages.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to create package", {
				description: error.message,
			});
		},
	});
}