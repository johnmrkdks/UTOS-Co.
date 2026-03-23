import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useIsCarBodyTypeExistMutation = () => {
	return useMutation(trpc.carBodyTypes.isCarBodyTypeExist.mutationOptions({}));
};
