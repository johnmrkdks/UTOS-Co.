import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useIsCarFeatureExistMutation = () => {
	return useMutation(trpc.carFeatures.isCarFeatureExist.mutationOptions({}));
};
