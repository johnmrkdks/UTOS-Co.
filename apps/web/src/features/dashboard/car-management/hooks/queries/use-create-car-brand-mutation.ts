import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCarBrandMutation = () => {
	return useMutation(trpc.carsBrands.create.mutationOptions({
		onSuccess: (data) => {
			toast.success(`Brand ${data.name} added`);
		},
	}));
};
