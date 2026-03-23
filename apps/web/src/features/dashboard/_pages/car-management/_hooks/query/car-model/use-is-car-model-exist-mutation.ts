import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useIsCarModelExistMutation = () => {
	return useMutation(trpc.carModels.isCarModelExist.mutationOptions({}));
};
