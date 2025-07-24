import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useCheckCarFuelTypeMutation = () => {
	return useMutation(trpc.carFuelTypes.isCarFuelTypeExist.mutationOptions());
};
