import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useIsCarTransmissionTypeExistMutation = () => {
	return useMutation(
		trpc.carTransmissionTypes.isCarTransmissionTypeExist.mutationOptions({}),
	);
};
