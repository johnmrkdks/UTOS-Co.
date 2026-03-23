import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useIsCarFuelTypeExistMutation = () => {
	return useMutation(trpc.carFuelTypes.isCarFuelTypeExist.mutationOptions({}));
};
