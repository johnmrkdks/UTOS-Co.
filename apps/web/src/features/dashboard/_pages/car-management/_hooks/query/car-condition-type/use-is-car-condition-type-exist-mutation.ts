import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useIsCarConditionTypeExistMutation = () => {
	return useMutation(
		trpc.carConditionTypes.isCarConditionTypeExist.mutationOptions({}),
	);
};
