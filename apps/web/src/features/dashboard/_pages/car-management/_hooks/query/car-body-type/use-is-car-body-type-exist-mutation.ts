
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useIsCarBodyTypeExistMutation = () => {
	return useMutation(trpc.carBodyTypes.isCarBodyTypeExist.mutationOptions({}));
};
