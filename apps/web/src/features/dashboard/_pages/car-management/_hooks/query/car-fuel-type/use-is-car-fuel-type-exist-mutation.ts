
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useIsCarFuelTypeExistMutation = () => {
	return useMutation(trpc.carFuelTypes.isCarFuelTypeExist.mutationOptions({}));
};
