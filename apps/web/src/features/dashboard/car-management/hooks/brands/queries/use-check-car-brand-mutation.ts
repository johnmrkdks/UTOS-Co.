import { trpc } from "@/trpc";

export const useCheckCarBrandMutation = () => {
	return trpc.carBrands.isCarBrandExist.useMutation();
};
