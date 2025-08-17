import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateDriverApplicationMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.drivers.createApplication.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.drivers.list.queryKey() });
		},
		onError: (error) => {
			console.error("Driver application error:", error);
		},
	}));
};