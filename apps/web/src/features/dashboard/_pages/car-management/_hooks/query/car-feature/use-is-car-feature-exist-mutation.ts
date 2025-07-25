
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useIsCarFeatureExistMutation = () => {
	return useMutation(trpc.carFeatures.isCarFeatureExist.mutationOptions({}));
};
