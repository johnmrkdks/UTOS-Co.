
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useIsCarCategoryExistMutation = () => {
	return useMutation(trpc.carCategories.isCarCategoryExist.mutationOptions({}));
};
