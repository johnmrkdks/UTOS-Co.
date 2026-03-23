import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useIsCarCategoryExistMutation = () => {
	return useMutation(trpc.carCategories.isCarCategoryExist.mutationOptions({}));
};
