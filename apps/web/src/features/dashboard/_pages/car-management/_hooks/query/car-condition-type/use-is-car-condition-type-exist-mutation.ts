
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useIsCarConditionTypeExistMutation = () => {
	return useMutation(trpc.carConditionTypes.isCarConditionTypeExist.mutationOptions({}));
};
