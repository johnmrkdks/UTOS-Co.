import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useCheckCarModelMutation = () => {
	return useMutation(trpc.carModels.isCarModelExist.mutationOptions());
};
