import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useCheckCarBrandMutation = () => {
	return useMutation(trpc.carBrands.isCarBrandExist.mutationOptions());
};
