
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useIsCarTransmissionTypeExistMutation = () => {
	return useMutation(trpc.carTransmissionTypes.isCarTransmissionTypeExist.mutationOptions({}));
};
