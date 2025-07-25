
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useIsCarModelExistMutation = () => {
	return useMutation(trpc.carModels.isCarModelExist.mutationOptions({}));
};
