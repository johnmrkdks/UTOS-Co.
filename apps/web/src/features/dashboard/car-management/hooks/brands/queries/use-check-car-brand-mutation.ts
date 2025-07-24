import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useCheckCarBrandMutation = () => {
	return useMutation(trpc.carBrands.isCarBrandExist.mutationOptions());
};
